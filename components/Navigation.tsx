"use client"

import React, {useState} from 'react';
import Link from "next/link";
import { useStockContext } from '@/app/context/StockContext';
import { signOut } from "next-auth/react";

export default function Navigation() {
  const [showMenu, setShowMenu] = useState(false);
  const {setShowAddWatchlist} = useStockContext();

  // ✅ REPLACE handleLogout with this:
  function handleLogout(){
    signOut({ callbackUrl: "/auth/login" });
  }
  
  return (
    <>
      <nav className='hidden md:block fixed top-0 w-full z-10'>
          <ul className='flex bg-main-dark text-white py-7 justify-around'>
              <li className='hover:text-slate-400'><Link href="/dashboard">Dashboard</Link></li>
              <li className='hover:text-slate-400'><Link href="/fundamentals">Fundamentals</Link></li>
              <li className='hover:text-slate-400'><Link href="/exchanges">Exchanges</Link></li>
              <li className='hover:text-slate-400'><button onClick={handleLogout}>Logout</button></li>
          </ul>
      </nav>
      <nav className='md:hidden fixed top-0 z-10 flex justify-end w-full px-7 bg-main-dark py-7'>
        <i onClick={()=>setShowMenu(!showMenu)} className="fa-solid fa-bars cursor-pointer" style={{color:"#fff"}}></i>
        <ul className={`absolute flex flex-col justify-start gap-4 right-0 h-[100vh] ${showMenu ? "translate-x-0" : "translate-x-80"} top-14 bg-main-dark text-white py-7  text-right px-7 transition ease-in-out duration-1000`}>
            <li className='hover:text-slate-400'><Link onClick={()=>setShowMenu(false)} href="/dashboard">Dashboard</Link></li>
            <li className='hover:text-slate-400'><Link onClick={()=>setShowMenu(false)} href="/fundamentals">Fundamentals</Link></li>
            <li className='hover:text-slate-400'><Link onClick={()=>setShowMenu(false)} href="/exchanges">Exchanges</Link></li>
            <li className='hover:text-slate-400'><Link onClick={()=>{setShowMenu(false); setShowAddWatchlist(true)}} href="/dashboard">Add Stock</Link></li>
            <li className='hover:text-slate-400'><button onClick={()=>{setShowMenu(false); handleLogout()}}>Logout</button></li>
        </ul>
      </nav>
    </>
    
  )
}