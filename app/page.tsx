"use client"
import { useState, useRef, useEffect, useMemo } from "react";
import styles from "./page.module.css"
import CircularProgressBar from "@/components/circularProgressBar/CircularProgressBar";
import Image from "next/image";
import Confetti from 'react-confetti'
import { toast } from "react-hot-toast";

export default function Home() {
  const [mode, modeSet] = useState<"countUp" | "countDown">("countUp")

  const { usingTime, runningTime, timeFinished, isPaused, handlePause, handlePlay, handleStart, handleRefresh } = useTimer()
  const [width, height] = useWindowSize()

  const [timeStartedStudying, timeStartedStudyingSet] = useState<Date>()
  const [timeStoppedStudying, timeStoppedStudyingSet] = useState<Date>()

  const [timeSpentStudying, timeSpentStudyingSet] = useState<number>()
  const [totalTimeStudying, totalTimeStudyingSet] = useState<number>()
  const [goalTime, goalTimeSet] = useState(5000)

  const [canShowConfetti, canShowConfettiSet] = useState(false)
  const [clickedStoppedStudyingButton, clickedStoppedStudyingButtonSet] = useState(false)

  //show confetti
  useEffect(() => {
    if (timeSpentStudying === undefined) {
      canShowConfettiSet(false)
      return
    }

    if (timeSpentStudying > goalTime) {
      toast.success("met goal!")

      canShowConfettiSet(true)
    }

  }, [timeSpentStudying, goalTime])

  function handleReset() {
    handleRefresh()
    timeStartedStudyingSet(undefined)
    timeStoppedStudyingSet(undefined)
    modeSet("countUp")
  }

  function handleStartStudying() {
    //set time started studying
    timeStartedStudyingSet(new Date())

    //refresh clock
    handleRefresh()

    //set mode
    const modeLocal = "countUp"
    modeSet(modeLocal)

    //start
    handleStart(Date.now() - (totalTimeStudying ?? 0), modeLocal)
  }

  return (
    <main className={styles.main}>
      <h1>5 min study</h1>

      <div className={styles.topCont}>
        {mode === "countUp" && (
          <>
            <button disabled={timeStartedStudying !== undefined} onClick={handleStartStudying}>Start Studying</button>

            {timeStartedStudying !== undefined && (
              <button disabled={timeStartedStudying !== undefined && timeStoppedStudying !== undefined} onClick={() => {
                //capture when stopped studying
                const timeStoppedStudyingLocal = new Date

                //pause the timer
                handlePause(mode)

                //record that time
                timeStoppedStudyingSet(timeStoppedStudyingLocal)

                //get how long has been studying for session
                let differenceInMillis = timeStoppedStudyingLocal.getTime() - timeStartedStudying.getTime()

                //set that time
                timeSpentStudyingSet(differenceInMillis)

                //increse total time
                totalTimeStudyingSet(prev => {
                  let newTimeSpentStudying = prev ?? 0
                  newTimeSpentStudying += differenceInMillis

                  return newTimeSpentStudying
                })

                //note button click
                clickedStoppedStudyingButtonSet(true)
              }}>Stop Studying</button>
            )}

            {timeStartedStudying !== undefined && timeStoppedStudying !== undefined && (
              <button onClick={() => {
                if (timeSpentStudying === undefined) return
                //refresh clock
                handleRefresh()

                //set mode
                const modeLocal = "countDown"

                //start
                handleStart(timeSpentStudying, modeLocal)
                modeSet(modeLocal)

                //rest button click
                clickedStoppedStudyingButtonSet(false)

              }}>Start Break</button>
            )}
          </>
        )}

        {!clickedStoppedStudyingButton && runningTime !== undefined && (
          <>
            {!isPaused && (
              <button disabled={timeFinished} onClick={() => handlePause(mode)}>Pause</button>
            )}

            {isPaused && (
              <button disabled={timeFinished} onClick={() => { handlePlay(mode) }}>Play</button>
            )}
          </>
        )}
      </div>

      {usingTime !== undefined && runningTime !== undefined && (
        <>
          <div className={styles.timerDisplayCont}>
            {usingTime.hours && (
              <CircularProgressBar label={runningTime.hours > 1 ? "hours" : "hour"} timeLeft={runningTime.hours} progress={mode === "countDown" ? 100 - (Math.floor((runningTime.hours / 24) * 100)) : (Math.floor((runningTime.hours / 24) * 100))} rotateDirection="reverse" timerFinished={timeFinished} />
            )}

            {usingTime.minutes && (
              <CircularProgressBar label={runningTime.minutes > 1 ? "minutes" : "minute"} timeLeft={runningTime.minutes} progress={mode === "countDown" ? 100 - (Math.floor((runningTime.minutes / 60) * 100)) : (Math.floor((runningTime.minutes / 60) * 100))} timerFinished={timeFinished} />
            )}

            {usingTime.seconds && (
              <CircularProgressBar label={runningTime.seconds > 1 ? "seconds" : "second"} timeLeft={runningTime.seconds} progress={mode === "countDown" ? 100 - (Math.floor((runningTime.seconds / 60) * 100)) : (Math.floor((runningTime.seconds / 60) * 100))} rotateDirection="reverse" timerFinished={timeFinished} />
            )}

            {usingTime.milliseconds && (
              <CircularProgressBar label={runningTime.milliseconds > 1 ? "milliseconds" : "millisecond"} timeLeft={runningTime.milliseconds} progress={mode === "countDown" ? 100 - (Math.floor((runningTime.milliseconds / 1000) * 100)) : (Math.floor((runningTime.milliseconds / 1000) * 100))} transitionTime={0} timerFinished={timeFinished} />
            )}
          </div>
        </>
      )}

      {timeFinished && (
        <div className={styles.bottomCont}>
          <h2>Timer Finished</h2>

          <button onClick={() => {
            //reset top buttons
            timeStartedStudyingSet(undefined)
            timeStoppedStudyingSet(undefined)

            //start studying
            handleStartStudying()
          }}>Continue Studying</button>

          <button onClick={handleReset}>refresh</button>
        </div>
      )}

      <Image alt="bg" src={require(`@/public/bg${Math.floor(Math.random() * 1)}.jpg`).default.src} width={2000} height={2000} style={{ objectFit: 'cover', position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: -1 }} />

      <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, right: 0, backgroundColor: 'var(--whiteSwitch)', opacity: .7, zIndex: -1 }}></div>

      {canShowConfetti && width && height && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          gravity={0.065}
          onConfettiComplete={() => { canShowConfettiSet(false) }}
        />
      )}
    </main>
  );
}





function useTimer() {
  const [time, timeSet] = useState<number>();
  const [usingTime, usingTimeSet] = useState<{
    hours: boolean,
    minutes: boolean,
    seconds: boolean,
    milliseconds: boolean
  }>();

  const [endTime, endTimeSet] = useState<number>();
  const [timeRemainingOnPause, timeRemainingOnPauseSet] = useState<number>();
  const [isPaused, isPausedSet] = useState(false)

  const countDownTimerInterval = useRef<NodeJS.Timeout>()
  const countUpTimerInterval = useRef<NodeJS.Timeout>()

  //start timer
  function handleStart(durationInMillis: number, mode: "countUp" | "countDown") {
    if (mode === "countDown") {
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
      countDownTimerInterval.current = setInterval(() => { decreaseTimer(endTimeLocal) }, 1);


    } else {
      //count Up

      //start counter add
      countUpTimerInterval.current = setInterval(() => { increaseTimer(durationInMillis) }, 1);
    }
  }

  function calculateTime(timeLeft: number) {
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    const milliseconds = timeLeft % 1000;

    return { hours, minutes, seconds, milliseconds }
  }

  function decreaseTimer(endTime: number) {
    //get current time
    const timeStarted = Date.now();

    //calculate time remaining
    let timeRemaining = endTime - timeStarted;

    if (timeRemaining < 0) {
      clearInterval(countDownTimerInterval.current);
      timeRemaining = 0;
    }

    //set global time left
    timeSet(timeRemaining);
  };

  function increaseTimer(startTime: number) {
    //get current time
    const currentTime = Date.now();

    //calculate time remaining
    let timeElapsed = currentTime - startTime;

    //check new values we can use 
    const { hours, minutes, seconds, milliseconds } = calculateTime(timeElapsed)

    //set whether using minutes/secods/hours or not
    usingTimeSet(prevUsingTime => {
      const newUsingTime = prevUsingTime === undefined ? { hours: false, minutes: false, seconds: false, milliseconds: false } : prevUsingTime

      if (hours > 0) {
        newUsingTime.hours = true
      }

      if (minutes > 0) {
        newUsingTime.minutes = true
      }

      if (seconds > 0) {
        newUsingTime.seconds = true
      }

      if (milliseconds > 0) {
        newUsingTime.milliseconds = true
      }

      return newUsingTime
    })

    //set global time
    timeSet(timeElapsed);
  };

  function handlePause(mode: "countUp" | "countDown") {
    if (mode === "countDown") {
      if (endTime === undefined) return

      isPausedSet(true)

      //clear interval
      if (countDownTimerInterval.current) { clearInterval(countDownTimerInterval.current) }

      const currentTime = Date.now();
      let timeRemaining = endTime - currentTime;

      //save remaining time
      timeRemainingOnPauseSet(timeRemaining)







    } else {
      //count Up

      isPausedSet(true)

      //clear interval
      if (countUpTimerInterval.current) { clearInterval(countUpTimerInterval.current) }
    }
  }

  function handlePlay(mode: "countUp" | "countDown") {
    if (mode === "countDown") {
      if (timeRemainingOnPause === undefined) return
      isPausedSet(false)

      handleStart(timeRemainingOnPause, mode)







    } else {
      //count up 
      if (time === undefined) return

      isPausedSet(false)
      handleStart(Date.now() - time, mode)
    }
  }

  function handleRefresh() {
    timeSet(undefined)
    usingTimeSet(undefined)
    endTimeSet(undefined)
    timeRemainingOnPauseSet(undefined)
    isPausedSet(false)
    if (countDownTimerInterval.current) clearInterval(countDownTimerInterval.current)
    countDownTimerInterval.current = undefined
  }

  return {
    usingTime,
    runningTime: time !== undefined ? calculateTime(time) : undefined,
    timeFinished: time === 0,
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