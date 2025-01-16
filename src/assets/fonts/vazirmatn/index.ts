import { Vazirmatn } from 'next/font/google'

export const vazirmatn = Vazirmatn({ 
  subsets: ['arabic', 'latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-vazirmatn'
})