"use client"

import React, {useState} from 'react';
import { financialMetrics } from '@/app/data/analysisInfoData';

export default function AnalysisInfoItem() {
    const [expand, setExpand] = useState<boolean | number>(false);

    function handleClick(id:number){
        if (id === expand) return setExpand(false);
        setExpand(id);
    };

  return (
    <div className='flex flex-col'>
        <h1 className='mt-7 text-center text-2xl'>Evaluation Of Financial Metrics</h1>
        <div>
            {financialMetrics.map(obj=>(
                <React.Fragment key={obj.id}>
                    <h2 onClick={()=>handleClick(obj.id)} className='my-7 text-xl font-bold cursor-pointer'>{obj.title}</h2>
                    <div className={`[&>h2]:font-bold [&>h2]:text-xl [&>h2]:my-5 [&>h3]:my-4 [&>div>h4]:font-bold [&>div>h4]:my-3 ${expand === obj.id ? "block" : "hidden"}`} dangerouslySetInnerHTML={{ __html: obj.content }}></div>
                </React.Fragment>
            ))}
        </div>
    </div>
  )
}
