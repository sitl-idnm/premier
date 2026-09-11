import { getSiteContent } from '@/shared/content'

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

const Home = async () => {
  const content = await getSiteContent()

  return (
    <main>
      <Hero data={content.hero} />
      <Promos data={content.promos} />
      <Salons data={content.salons} />
      <Prices data={content.prices} />
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
