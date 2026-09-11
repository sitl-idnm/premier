import { type SiteContent } from '@/shared/content/defaults'

export type GroupId = Exclude<keyof SiteContent, 'metrika'>

export type GroupDef = {
  id: GroupId
  title: string
  desc: string
}

/** Editable content groups shown as dashboard cards and sidebar links.
 *  Only the design-agnostic groups exist for now — landing sections are added
 *  to defaults.ts (and here) once the «Премьер» Figma handoff defines them. */
export const GROUPS: GroupDef[] = [
  { id: 'hero', title: 'Обложка', desc: 'Заголовок, подпись и текст первого экрана.' },
  { id: 'promos', title: 'Акции', desc: 'Заголовок и карточки акций.' },
  { id: 'salons', title: 'Выбор салона', desc: 'Заголовок, подзаголовок и карточки салонов.' },
  { id: 'about', title: 'О нас', desc: 'Заголовок и текст блока «о салоне».' },
  { id: 'portfolio', title: 'Портфолио', desc: 'Заголовок и текст призыва в галерее работ.' },
  { id: 'gifts', title: 'Сертификаты', desc: 'Заголовок, подзаголовок и кнопка блока сертификатов.' },
  { id: 'loyalty', title: 'Программа лояльности', desc: 'Заголовок, подзаголовок и список преимуществ.' },
  { id: 'reviews', title: 'Отзывы', desc: 'Заголовок, вступление и карточки отзывов.' },
  { id: 'locations', title: 'Карта салонов', desc: 'Заголовок, подзаголовок и карточки адресов.' },
  { id: 'contacts', title: 'Контакты и ссылки', desc: 'Телефон, VK, Telegram, сайт, адрес, часы работы.' },
  { id: 'meta', title: 'SEO / мета', desc: 'Title, description и ключевые слова.' },
  { id: 'header', title: 'Шапка', desc: 'Пункты меню и подпись ссылки маршрута.' },
  { id: 'footer', title: 'Футер', desc: 'Реквизиты, юр. ссылки, подпись соцсети.' },
  { id: 'forms', title: 'Формы заявок', desc: 'Подписи полей, согласие, кнопки.' },
  { id: 'modals', title: 'Окна заявок', desc: 'Заголовки модальных окон и «спасибо».' },
  { id: 'legal', title: 'Документы', desc: 'Политика конфиденциальности и соглашение.' }
]

export function groupById(id: string): GroupDef | undefined {
  return GROUPS.find((g) => g.id === id)
}
