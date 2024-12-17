import React from 'react';
import Details from './Details';
import { SearchParamsContext } from 'next/dist/shared/lib/hooks-client-context.shared-runtime';

export default async function page({params, searchParams}: {params: { id: string },
  searchParams: { [key: string]: string | undefined }}) {
  const { id } = await params; 
  const query = await searchParams || 'default'; 
  const name = query.name || "";
  
  console.log({ id, name });
  
  return (
      <div>
          <Details id={id} name={name} />
      </div>
  );
}
