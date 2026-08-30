import EmbedClient from '@/components/EmbedClient'
import { getSession } from '@/lib/getSession'
import { redirect } from 'next/navigation'
import React from 'react'

async function page() {
  const session = await getSession()

  if (!session?.user?.id) {
    redirect("/")
  }

  return (
    <>
      <EmbedClient ownerId={session.user.id} />
    </>
  )
}

export default page
