export { default as NewsForm } from '../../components/NewsForm/NewsForm.vue'
export { default as NewsItem } from '../../components/NewsItem/NewsItem.vue'
export { default as NewsList } from '../../components/NewsList/NewsList.vue'

export const LazyNewsForm = import('../../components/NewsForm/NewsForm.vue' /* webpackChunkName: "components/NewsForm/NewsForm" */).then(c => c.default || c)
export const LazyNewsItem = import('../../components/NewsItem/NewsItem.vue' /* webpackChunkName: "components/NewsItem/NewsItem" */).then(c => c.default || c)
export const LazyNewsList = import('../../components/NewsList/NewsList.vue' /* webpackChunkName: "components/NewsList/NewsList" */).then(c => c.default || c)
