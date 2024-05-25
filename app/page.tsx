"use client"
import { useState, useRef, useEffect } from "react";
import styles from "./page.module.css"
import CircularProgressBar from "@/components/circularProgressBar/CircularProgressBar";
import Image from "next/image";
import Confetti from 'react-confetti'
import { toast } from "react-hot-toast";

export default function Home() {
  const { usingTime, runningTime, timeLeft, isPaused, handlePause, handlePlay, handleStart, handleRefresh } = useTimer()
  const [width, height] = useWindowSize()

  const met5MinGoalDebounce = useRef<NodeJS.Timeout>()

  const [timeStartedStudying, timeStartedStudyingSet] = useState<Date>()
  const [timeStoppedStudying, timeStoppedStudyingSet] = useState<Date>()
  const [metGoal, metGoalSet] = useState(false)

  function handleReset() {
    handleRefresh()
    timeStartedStudyingSet(undefined)
    timeStoppedStudyingSet(undefined)
    metGoalSet(false)
  }

  return (
    <main className={styles.main}>
      <h1>5 min study</h1>

      <div className={styles.topCont}>
        {runningTime === undefined ? (
          <>
            <button disabled={timeStartedStudying !== undefined} onClick={() => {
              timeStartedStudyingSet(new Date)

              met5MinGoalDebounce.current = setTimeout(() => {
                metGoalSet(true)
                toast.success("met goal!")
              }, 300000);
            }}>Start Studying</button>

            {timeStartedStudying !== undefined && (
              <button disabled={timeStartedStudying !== undefined && timeStoppedStudying !== undefined} onClick={() => {
                timeStoppedStudyingSet(new Date)

                if (met5MinGoalDebounce.current) { clearTimeout(met5MinGoalDebounce.current) }
              }}>Stop Studying</button>
            )}

            {timeStartedStudying !== undefined && timeStoppedStudying !== undefined && (
              <button onClick={() => {
                if (!timeStartedStudying || !timeStoppedStudying) return

                let differenceInMillis = timeStoppedStudying.getTime() - timeStartedStudying.getTime()

                handleStart(differenceInMillis)
              }}>Start Break</button>
            )}
          </>
        ) : (
          <>
            {!isPaused && (
              <button disabled={timeLeft === 0} onClick={handlePause}>Pause</button>
            )}

            {isPaused && (
              <button disabled={timeLeft === 0} onClick={handlePlay}>Play</button>
            )}
          </>
        )}
      </div>

      {usingTime !== undefined && runningTime !== undefined && (
        <>
          <div className={styles.timerDisplayCont}>
            {usingTime.hours && (
              <CircularProgressBar label={runningTime.hours > 1 ? "hours" : "hour"} timeLeft={runningTime.hours} progress={100 - (Math.floor((runningTime.hours / 24) * 100))} rotateDirection="reverse" timerFinished={timeLeft === 0} />
            )}

            {usingTime.minutes && (
              <CircularProgressBar label={runningTime.minutes > 1 ? "minutes" : "minute"} timeLeft={runningTime.minutes} progress={100 - (Math.floor((runningTime.minutes / 60) * 100))} timerFinished={timeLeft === 0} />
            )}

            {usingTime.seconds && (
              <CircularProgressBar label={runningTime.seconds > 1 ? "seconds" : "second"} timeLeft={runningTime.seconds} progress={100 - (Math.floor((runningTime.seconds / 60) * 100))} rotateDirection="reverse" timerFinished={timeLeft === 0} />
            )}

            {usingTime.milliseconds && (
              <CircularProgressBar label={runningTime.milliseconds > 1 ? "milliseconds" : "millisecond"} timeLeft={runningTime.milliseconds} progress={100 - (Math.floor((runningTime.milliseconds / 1000) * 100))} transitionTime={0} timerFinished={timeLeft === 0} />
            )}
          </div>
        </>
      )}

      {timeLeft === 0 && (
        <div className={styles.bottomCont}>
          <h2>Timer Finished</h2>

          <button onClick={handleReset}>refresh</button>
        </div>
      )}

      <Image alt="bg" src={require(`@/public/bg${Math.floor(Math.random() * 1)}.jpg`).default.src} width={2000} height={2000} style={{ objectFit: 'cover', position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: -1 }} />

      <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, right: 0, backgroundColor: 'var(--whiteSwitch)', opacity: .7, zIndex: -1 }}></div>

      {metGoal && width && height && (
        <Confetti
          width={width}
          height={height}
          run={metGoal}
          recycle={false}
          gravity={0.065}
        />
      )}
    </main>
  );
}





function useTimer() {
  const [timeLeft, timeLeftSet] = useState<number>();
  const [usingTime, usingTimeSet] = useState<{
    hours: boolean,
    minutes: boolean,
    seconds: boolean,
    milliseconds: boolean
  }>();

  const [endTime, endTimeSet] = useState<number>();
  const [timeRemainingOnPause, timeRemainingOnPauseSet] = useState<number>();
  const [isPaused, isPausedSet] = useState(false)

  const timerInterval = useRef<NodeJS.Timeout>()

  //start timer
  function handleStart(durationInMillis: number) {

    console.log(`$durationInMillis`, durationInMillis);

    //get the start time
    const startTimeLocal = Date.now();

    //get the end time
    const endTimeLocal = startTimeLocal + durationInMillis;
    endTimeSet(endTimeLocal)

    //get remainding time first calculation 
    let timeRemaining = endTimeLocal - startTimeLocal;
    const { hours, minutes, seconds, milliseconds } = calculateTime(timeRemaining)

    //set whether using minutes/secods/hours or not
    usingTimeSet({ hours: hours > 0 ? true : false, minutes: minutes > 0 ? true : false, seconds: seconds > 0 ? true : false, milliseconds: milliseconds > 0 ? true : false })

    //start time loop
    timerInterval.current = setInterval(() => { updateTimer(endTimeLocal) }, 1);
  }

  function updateTimer(endTime: number) {
    //get current time
    const timeStarted = Date.now();

    //calculate time remaining
    let timeRemaining = endTime - timeStarted;

    if (timeRemaining < 0) {
      clearInterval(timerInterval.current);
      timeRemaining = 0;
    }

    //set global time left
    timeLeftSet(timeRemaining);
  };

  function handlePause() {
    if (endTime === undefined) return

    isPausedSet(true)

    //clear interval
    if (timerInterval.current) { clearInterval(timerInterval.current) }

    const currentTime = Date.now();
    let timeRemaining = endTime - currentTime;

    //save remaining time
    timeRemainingOnPauseSet(timeRemaining)
  }

  function handlePlay() {
    if (timeRemainingOnPause === undefined) return
    isPausedSet(false)

    handleStart(timeRemainingOnPause)
  }

  function handleRefresh() {
    timeLeftSet(undefined)
    usingTimeSet(undefined)
    endTimeSet(undefined)
    timeRemainingOnPauseSet(undefined)
    isPausedSet(false)
    if (timerInterval.current) clearInterval(timerInterval.current)
    timerInterval.current = undefined
  }

  function calculateTime(timeLeft: number) {
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    const milliseconds = timeLeft % 1000;

    return { hours, minutes, seconds, milliseconds }
  }

  return {
    usingTime,
    runningTime: timeLeft !== undefined ? calculateTime(timeLeft) : undefined,
    timeLeft: timeLeft,
    isPaused,
    handlePause,
    handlePlay,
    handleStart,
    handleRefresh
  }
};

function useWindowSize() {
  const [width, widthSet] = useState<number>()
  const [height, heightSet] = useState<number>()

  useEffect(() => {
    document.addEventListener("resize", handleRezie)

    widthSet(window.innerWidth)
    heightSet(window.innerHeight)

    return () => {
      document.removeEventListener("resize", handleRezie)
    }
  }, [])

  function handleRezie() {
    widthSet(window.innerWidth)
    heightSet(window.innerHeight)
  }

  return [width, height]
}