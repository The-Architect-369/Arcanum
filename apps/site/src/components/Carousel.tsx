"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type Slide = { title: string; body: string };
export default function Carousel({ slides, id }: { slides: readonly Slide[]; id: string }) {
  const [i,setI]=useState(0);
  const wrap = (n:number)=> (n+slides.length)%slides.length;

  // swipe
  const box = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const el = box.current!;
    let sx=0, sy=0, mx=0, my=0, touching=false;
    const start=(e:TouchEvent)=>{ touching=true; const t=e.touches[0]; sx=t.clientX; sy=t.clientY; };
    const move =(e:TouchEvent)=>{ if(!touching) return; const t=e.touches[0]; mx=t.clientX-sx; my=t.clientY-sy; };
    const end =()=>{ if(!touching) return; touching=false; if(Math.abs(mx)>50 && Math.abs(my)<40) setI(p=> wrap(p + (mx<0?1:-1))); mx=my=0; };
    el.addEventListener("touchstart",start,{passive:true});
    el.addEventListener("touchmove",move,{passive:true});
    el.addEventListener("touchend",end);
    return ()=>{ el.removeEventListener("touchstart",start); el.removeEventListener("touchmove",move); el.removeEventListener("touchend",end); };
  },[]);

  return (
    <div ref={box} className="relative card p-6 md:p-8">
      <div className="flex items-center justify-between">
        <h3 className="h2">{slides[i].title}</h3>
        <div className="flex gap-2">
          <button aria-label="Prev" className="carousel-btn" onClick={()=>setI(p=>wrap(p-1))}><ChevronLeft /></button>
          <button aria-label="Next" className="carousel-btn" onClick={()=>setI(p=>wrap(p+1))}><ChevronRight /></button>
        </div>
      </div>
      <p className="mt-3 opacity-90">{slides[i].body}</p>
      <div className="mt-5 flex justify-center gap-2">
        {slides.map((_,idx)=> <span key={id+idx} className="dot" data-active={idx===i} />)}
      </div>
    </div>
  );
}
