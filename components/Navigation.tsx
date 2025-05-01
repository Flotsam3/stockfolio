"use client"

import React, {useState} from 'react';
import Link from "next/link";
import { useStockContext } from '@/app/context/StockContext';


export default function Navigation() {
  const [showMenu, setShowMenu] = useState(false);
  const {setShowAddWatchlist} = useStockContext();
  
  return (
    <>
      <nav className='hidden md:block fixed top-0 w-full z-10'>
          <ul className='flex bg-main-dark text-white py-7 justify-around'>
              <li className='hover:text-slate-400'><Link href="/">Dashboard</Link></li>
              <li className='hover:text-slate-400'><Link href="/fundamentals">Fundamentals</Link></li>
              <li className='hover:text-slate-400'><Link href="/exchanges">Exchanges</Link></li>
          </ul>
      </nav>
      <nav className='md:hidden fixed top-0 z-10 flex justify-end w-full px-7 bg-main-dark py-7'>
        <i onClick={()=>setShowMenu(!showMenu)} className="fa-solid fa-bars cursor-pointer" style={{color:"#fff"}}></i>
        <ul className={`absolute flex flex-col justify-start gap-4 right-0 h-[100vh] ${showMenu ? "translate-x-0" : "translate-x-80"} top-14 bg-main-dark text-white py-7  text-right px-7 transition ease-in-out duration-1000`}>
            <li className='hover:text-slate-400'><Link onClick={()=>setShowMenu(false)} href="/">Dashboard</Link></li>
            <li className='hover:text-slate-400'><Link onClick={()=>setShowMenu(false)} href="/fundamentals">Fundamentals</Link></li>
            <li className='hover:text-slate-400'><Link onClick={()=>setShowMenu(false)} href="/exchanges">Exchanges</Link></li>
            <li className='hover:text-slate-400'><Link onClick={()=>{setShowMenu(false); setShowAddWatchlist(true)}} href="/">Add Stock</Link></li>
        </ul>
      </nav>
    </>
    
  )
}
