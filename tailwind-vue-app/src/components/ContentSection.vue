<template>
  <div>
    <div class="relative overflow-hidden max-h-80">
      <img
        src="../assets/img/forest.jpg"
        style="filter: blur(4px) grayscale(25%)"
      />
      <div class="absolute left-20 top-6 md:top-1/4">
        <div class="text-5xl font-bold text-white uppercase">
          May we <br />introduce
        </div>
        <button
          class="px-3 py-2 my-3 uppercase bg-white rounded text-s focus:outline-none"
        >
          More
        </button>
      </div>
    </div>
    <div class="flex flex-col md:m-5 md:flex-row">
      <ContentItem
        class="m-5 md:m-10"
        :img="require('../assets/img/face1.jpeg')"
        title="What"
      >
        Lorem ipsum dolor sit amet, cu regione fabellas vel. Quo sint
        complectitur id, has no meliore blandit detracto, semper copiosae no
        pri. Nam at veniam timeam inermis, vel ne menandri ocurreret, alia
        patrioque no vim. Cu accusam offendit persequeris per, et per veri
        civibus omittantur.
      </ContentItem>
      <ContentItem
        class="m-5 md:m-10"
        :img="require('../assets/img/face2.jpeg')"
        title="We"
      >
        Vel et graeci vivendo, sumo soluta deserunt his in. Quo ea tantas
        integre impedit. Te eum semper detracto accusata, case mollis pro no, no
        quot nulla disputando mea. Vix omnesque explicari omittantur ea, vidit
        commune explicari sit in.
      </ContentItem>
      <ContentItem
        class="m-5 md:m-10"
        :img="require('../assets/img/face3.jpeg')"
        title="Do"
      >
        Populo quaeque constituto ad pro, usu minimum fastidii oportere ne.
        Sonet pericula te ius, habemus gubergren et eam. Eum an populo mollis
        civibus. Ex ius sint possim salutatus. At zril iudico diceret duo, nam
        te choro consul assentior, enim suavitate consequat ut has.
      </ContentItem>
    </div>
  </div>
</template>

<script>
import ContentItem from "./ContentItem.vue";

export default {
  name: "ContentSection",
  components: { ContentItem },
};
</script>