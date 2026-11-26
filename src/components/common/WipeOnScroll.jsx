"use client"

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const WIPERS = [
  { selector: ".image", revealClass: "reveal-image" },
//   { selector: ".image2", revealClass: "reveal-image2" },
//   { selector: ".image3", revealClass: "reveal-image3" },
];

export default function WipeOnScroll(){
    const pathname = usePathname();

    useEffect(()=>{
        const wipeOn = ()=>{
            if (window.innerWidth < 992) return;

            WIPERS.forEach(({selector, revealClass})=>{
                document.querySelectorAll(selector).forEach((el)=>{
                    const rect = el.getBoundingClientRect();
                    if (rect.top < window.innerHeight - 200) {
                        el.classList.add(revealClass);
                    }
                })
            })
        }
        // document.querySelectorAll('.image');

        // Throttle to one pass per frame; this runs on every scroll event and
        // reads layout, so un-throttled it caused forced reflows.
        let frame = 0;
        const onScroll = ()=>{
            if (frame) return;
            frame = requestAnimationFrame(()=>{
                frame = 0;
                wipeOn();
            });
        }

        wipeOn();

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);

        return()=>{
            cancelAnimationFrame(frame);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        }

    }, [pathname])

    return null;
}