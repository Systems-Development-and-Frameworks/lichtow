<template>
  <div id="app">
    <div class="flex flex-col justify-between w-screen h-screen">
      <Header />
      <ContentSection class="flex-grow" />
      <Footer />
    </div>
  </div>
</template>

<script>
import ContentSection from "./components/ContentSection.vue";
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";

export default {
  name: "App",
  components: {
    ContentSection,
    Header,
    Footer,
  },
};
</script>
