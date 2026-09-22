import { getSiteContent } from '@/shared/content'
import { getLiveCatalog, getSpecialists } from '@/shared/lib/yclients/catalog'

import About from './sections/about/About'
import Gifts from './sections/gifts/Gifts'
import Hero from './sections/hero/Hero'
import Loyalty from './sections/loyalty/Loyalty'
import Locations from './sections/locations/Locations'
import Portfolio from './sections/portfolio/Portfolio'
import Prices from './sections/prices/Prices'
import Promos from './sections/promos/Promos'
import Reviews from './sections/reviews/Reviews'
import Salons from './sections/salons/Salons'
import Specialists from './sections/specialists/Specialists'

const Home = async () => {
  const content = await getSiteContent()

  // Live YClients data (falls back to static content when not configured).
  const [liveCatalog, staff] = await Promise.all([
    getLiveCatalog(),
    getSpecialists()
  ])
  const prices = liveCatalog
    ? { ...content.prices, salons: liveCatalog }
    : content.prices
  const hasStaff = staff.some((s) => s.list.length)

  return (
    <main>
      <Hero data={content.hero} />
      <Promos data={content.promos} />
      <Salons data={content.salons} />
      <Prices data={prices} />
      {hasStaff && <Specialists salons={staff} />}
      <About data={content.about} />
      <Portfolio data={content.portfolio} />
      <Gifts data={content.gifts} />
      <Loyalty data={content.loyalty} />
      <Reviews data={content.reviews} />
      <Locations data={content.locations} />
    </main>
  )
}

export default Home
