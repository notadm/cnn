import './globals.css'
import { Inter } from 'next/font/google'
import icon from './favicon.ico'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
		title: 'MNIST CNN',
    	description: '-',
}


export default function RootLayout({ children }) {
  return (
    <html lang="en">
			<link rel="icon" href={icon.src}/> 
      <body className={inter.className}>{children}</body>
    </html>
  )
}
