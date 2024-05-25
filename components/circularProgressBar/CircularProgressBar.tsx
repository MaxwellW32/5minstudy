// "use client"
import { useEffect, useState, useRef } from "react"
import styles from "./styles.module.css"

export default function CircularProgressBar({ label, timeLeft, progress, transitionTime = 1000, color1 = "#5394fd", circleBgColor = "#ddd", rotateDirection = "forwards", timerFinished = false }: { label: string, timeLeft: number, progress: number, transitionTime?: number, color1?: string, circleBgColor?: string, rotateDirection?: "forwards" | "reverse", timerFinished?: boolean }) {
    const [flip, flipSet] = useState(false)
    const hitFlipAlready = useRef(false)

    //handle flip
    useEffect(() => {
        if (progress <= 2) {
            if (!hitFlipAlready.current) {
                flipSet(prev => !prev)
            }

            hitFlipAlready.current = true
        } else {
            hitFlipAlready.current = false
        }
    }, [progress])

    return (
        <div className={styles.cont}>
            <svg className={styles.circularProgress} style={{ "--progress": progress, "--background": flip ? color1 : circleBgColor, "--stroke1": flip ? circleBgColor : color1, "--rotateDirection": rotateDirection, "--playState": timerFinished ? "paused" : "running" } as React.CSSProperties} width="250" height="250" viewBox="0 0 250 250">
                <circle className={styles.bg}></circle>
                <circle className={styles.fg} style={{ transition: `stroke-dasharray ${(progress >= 99 || progress <= 3) ? 0 : transitionTime}ms linear` }}></circle>
            </svg>

            <div className={styles.textCont}>
                <h3 className={styles.progress}>{timeLeft}</h3>
                <p className={styles.label}>{label}</p>
            </div>
        </div>
    )
}

