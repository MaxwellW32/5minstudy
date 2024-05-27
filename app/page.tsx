"use client"
import { useState, useRef, useEffect, useMemo } from "react";
import styles from "./page.module.css"
import CircularProgressBar from "@/components/circularProgressBar/CircularProgressBar";
import Image from "next/image";
import Confetti from 'react-confetti'
import { toast } from "react-hot-toast";

export default function Home() {
  const { usingTime: usingTimeCD, runningTime: runningTimeCD, timeFinished: timeFinishedCD, isPaused: isPausedCD, pause: pauseCD, play: playCD, start: startCD, refreshTimer: refreshTimerCD, time: timeCD } = useTimer("countDown")
  const { usingTime: usingTimeCU, runningTime: runningTimeCU, timeFinished: timeFinishedCU, isPaused: isPausedCU, pause: pauseCU, play: playCU, start: startCU, refreshTimer: refreshTimerCU, time: timeCU } = useTimer("countUp")
  const [width, height] = useWindowSize()

  const [canShowConfetti, canShowConfettiSet] = useState(false)

  const [mode, modeSet] = useState<"studying" | "notStudying" | "break">("notStudying")

  const [totalTimeStudying, totalTimeStudyingSet] = useState<number>(0)

  const [timeWhenBreakStarted, timeWhenBreakStartedSet] = useState<number>()
  const [totalBreakTime, totalBreakTimeSet] = useState<number>(0)

  const egTimeSetter = useRef(() => {
    const seconds = 1000 * 30
    const minutes = 1000 * 60 * 0
    const hours = 1000 * 60 * 60 * 0

    return hours + minutes + seconds
  })

  function displayFormattedTime(timeLeft: number) {
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    const milliseconds = timeLeft % 1000;

    const strArr: string[] = []

    if (hours > 0) {
      strArr.push(`${hours}h`)
    }

    if (minutes > 0) {
      strArr.push(`${minutes}m`)
    }

    if (seconds > 0) {
      strArr.push(`${seconds}s`)
    }

    if (milliseconds > 0) {
      strArr.push(`${milliseconds}ms`)
    }

    return strArr.join(" ")
  }

  function checkIfCanShowConfetti() {
    if (timeCU === undefined || timeCU < 300000) return

    toast.success("met goal!")

    canShowConfettiSet(true)
  }

  return (
    <main className={styles.main}>
      <div className={styles.topCont}>
        {mode !== "break" && (
          <>
            <button disabled={mode === "studying"}
              onClick={() => {
                modeSet("studying")

                const currentTime = Date.now()

                startCU(currentTime)
              }}
            >Start Studying</button>

            <button disabled={mode === "notStudying"}
              onClick={() => {
                if (timeCU === undefined) return
                modeSet("notStudying")

                pauseCU()

                checkIfCanShowConfetti()

                //increse total time
                totalTimeStudyingSet(prev => {
                  const newTimeSpentStudying = prev + timeCU

                  return newTimeSpentStudying
                })
              }}
            >Stop Studying</button>
          </>
        )}

        {mode !== "studying" && totalTimeStudying - totalBreakTime > 0 && (
          <button disabled={mode === "break"}
            onClick={() => {
              if (totalTimeStudying === undefined) return
              modeSet("break")

              const breakTimeDuration = totalTimeStudying - totalBreakTime

              //start
              startCD(breakTimeDuration)

              timeWhenBreakStartedSet(breakTimeDuration)
            }}
          >Go On Break</button>
        )}

        {mode === "break" && (
          <>
            <button onClick={() => {
              if (timeWhenBreakStarted === undefined || timeCD === undefined) return
              pauseCD()

              modeSet("notStudying")

              const breakSessionDuration = timeWhenBreakStarted - timeCD

              totalBreakTimeSet(prev => {
                const newBreakTime = prev + breakSessionDuration

                return newBreakTime
              })
            }}>end break</button>
          </>
        )}
      </div>

      <div className={styles.timerDisplayCont}>
        {mode === "break" && usingTimeCD !== undefined && runningTimeCD !== undefined && (
          <div className={styles.timerDisplayCont}>
            {usingTimeCD.hours && (
              <CircularProgressBar label={runningTimeCD.hours !== 1 ? "hours" : "hour"} timeLeft={runningTimeCD.hours} progress={100 - (Math.floor((runningTimeCD.hours / 24) * 100))} rotateDirection="reverse" timerFinished={timeFinishedCD} />
            )}

            {usingTimeCD.minutes && (
              <CircularProgressBar label={runningTimeCD.minutes !== 1 ? "minutes" : "minute"} timeLeft={runningTimeCD.minutes} progress={100 - (Math.floor((runningTimeCD.minutes / 60) * 100))} timerFinished={timeFinishedCD} />
            )}

            {usingTimeCD.seconds && (
              <CircularProgressBar label={runningTimeCD.seconds !== 1 ? "seconds" : "second"} timeLeft={runningTimeCD.seconds} progress={100 - (Math.floor((runningTimeCD.seconds / 60) * 100))} timerFinished={timeFinishedCD} />
            )}

            {usingTimeCD.milliseconds && (
              <CircularProgressBar label={runningTimeCD.milliseconds !== 1 ? "milliseconds" : "millisecond"} timeLeft={runningTimeCD.milliseconds} progress={100 - (Math.floor((runningTimeCD.milliseconds / 1000) * 100))} timerFinished={timeFinishedCD} transitionTime={0} />
            )}
          </div>
        )}

        {mode !== "break" && usingTimeCU !== undefined && runningTimeCU !== undefined && (
          <div className={styles.timerDisplayCont}>
            {usingTimeCU.hours && (
              <CircularProgressBar label={runningTimeCU.hours !== 1 ? "hours" : "hour"} timeLeft={runningTimeCU.hours} progress={Math.floor((runningTimeCU.hours / 24) * 100)} rotateDirection="reverse" timerFinished={timeFinishedCU} />
            )}

            {usingTimeCU.minutes && (
              <CircularProgressBar label={runningTimeCU.minutes !== 1 ? "minutes" : "minute"} timeLeft={runningTimeCU.minutes} progress={Math.floor((runningTimeCU.minutes / 60) * 100)} timerFinished={timeFinishedCU} />
            )}

            {usingTimeCU.seconds && (
              <CircularProgressBar label={runningTimeCU.seconds !== 1 ? "seconds" : "second"} timeLeft={runningTimeCU.seconds} progress={Math.floor((runningTimeCU.seconds / 60) * 100)} timerFinished={timeFinishedCU} />
            )}

            {usingTimeCU.milliseconds && (
              <CircularProgressBar label={runningTimeCU.milliseconds !== 1 ? "milliseconds" : "millisecond"} timeLeft={runningTimeCU.milliseconds} progress={Math.floor((runningTimeCU.milliseconds / 1000) * 100)} timerFinished={timeFinishedCU} transitionTime={0} />
            )}
          </div>
        )}
      </div>

      <h2 style={{ justifySelf: "center", opacity: (mode === "notStudying" && totalTimeStudying > 0) ? "" : 0, textAlign: "center" }}>Total Studying Time <br />{displayFormattedTime(totalTimeStudying)}</h2>

      {timeFinishedCD && mode === "break" && (
        <div className={styles.bottomCont}>
          <h2>Timer Finished</h2>
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
  )
}

function useTimer(mode: "countUp" | "countDown") {
  const [time, timeSet] = useState<number>();
  const [usingTime, usingTimeSet] = useState<{
    hours: boolean,
    minutes: boolean,
    seconds: boolean,
    milliseconds: boolean
  }>();
  const [isPaused, isPausedSet] = useState(false);

  const countDownTimerInterval = useRef<NodeJS.Timeout>()
  const countUpTimerInterval = useRef<NodeJS.Timeout>()

  //start timer
  function start(durationInMillis: number) {
    if (mode === "countDown") {
      //get the start time
      const startTime = Date.now();

      //choose a time in the future for the end time - then count down to that
      const endTime = startTime + durationInMillis;

      //get remainding time initial calculation 
      let timeRemaining = endTime - startTime;
      const { hours, minutes, seconds, milliseconds } = calculateTime(timeRemaining)

      //set whether using minutes/secods/hours or not
      usingTimeSet({ hours: hours > 0 ? true : false, minutes: minutes > 0 ? true : false, seconds: seconds > 0 ? true : false, milliseconds: milliseconds > 0 ? true : false })

      //start time loop
      countDownTimerInterval.current = setInterval(() => { decreaseTimer(endTime) }, 1);


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
    //calculate time between now and the time in the passed
    const currentTime = Date.now()
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

  function pause() {
    if (mode === "countDown") {
      //clear interval
      if (countDownTimerInterval.current) { clearInterval(countDownTimerInterval.current) }

      isPausedSet(true)


    } else {
      //count Up
      isPausedSet(true)

      //clear interval
      if (countUpTimerInterval.current) { clearInterval(countUpTimerInterval.current) }
    }
  }

  function play() {
    if (mode === "countDown") {
      if (time === undefined) return

      isPausedSet(false)

      start(time)

    } else {
      //count up 
      if (time === undefined) return

      isPausedSet(false)

      start(Date.now() - time)
    }
  }

  function refreshTimer() {
    timeSet(undefined)
    usingTimeSet(undefined)
    isPausedSet(false)
    if (countDownTimerInterval.current) clearInterval(countDownTimerInterval.current)
    countDownTimerInterval.current = undefined
  }

  return {
    usingTime,
    runningTime: time !== undefined ? calculateTime(time) : undefined,
    timeFinished: time === 0,
    time: time,
    isPaused,
    pause,
    play,
    start,
    refreshTimer
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