// ABOUTME: Home page that redirects immediately to simple journal
// Makes the simplified journal the default landing experience

import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/simple-journal');
}