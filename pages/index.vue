<template>
  <div id="up-side" class="side">
    <h2 class="title">
      Welcome to the easiest <span class="cvMakerTextUp">CV Maker</span> you will ever <span class = "fancy">use.</span>
    </h2>
  </div>

  <div id="down-side" class="side">
    <h2 class="title">
      Welcome to the easiest <span class="cvMakerTextDown">CV Maker</span> you will ever <span class = "fancy">need.</span>
    </h2>
  </div>
  <NuxtLink to="/cvmaker">
    <button @mouseover="showText" @mouseleave="hideText" class="linkButton">
      <svg class="rotating-text" width="100" height="100" viewBox="0 0 200 200">
        <defs>
          <path id="circlePath" d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0" />
        </defs>
        <text font-size="40">
          <textPath :href="'#circlePath'">
            {{ hoveredText || 'Hover me' }}
          </textPath>
        </text>
      </svg>
    </button>
  </NuxtLink>
  
</template>

<script>
export default {
  mounted() {
    const down = document.getElementById("down-side");
    const handleOnMove = e => {
      const p = e.clientY / window.innerHeight * 100;
      down.style.height = `${p}%`;
      down.style.zIndex = 3;
    }

    document.onmousemove = e => handleOnMove(e);
    document.ontouchmove = e => handleOnMove(e.touches[0]);
  }
}

</script>

<script setup>
const hoveredText = ref('');

const showText = () => {
  setTimeout(() => {
    hoveredText.value = 'Make your first CV';
  }, 500);
};

const hideText = () => {
  setTimeout(() => {
    hoveredText.value = '';
  }, 500);
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Lobster&display=swap');

</style>