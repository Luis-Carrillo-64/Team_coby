<template>
  <img
    :src="iconSrc"
    :alt="`${categoria} icon`"
    class="achievement-icon"
    draggable="false"
  />
</template>

<script>
export default {
  name: "AchievementIcon",
  props: {
    categoria: {
      type: String,
      required: true,
    },
  },
  computed: {
    iconSrc() {
      const icons = {
        Bronce: "https://cdn-icons-png.flaticon.com/512/1752/1752776.png",
        Bronze: "https://cdn-icons-png.flaticon.com/512/1752/1752776.png",
        Plata: "https://cdn-icons-png.flaticon.com/512/1752/1752699.png",
        Silver: "https://cdn-icons-png.flaticon.com/512/1752/1752699.png",
        Oro: "https://cdn-icons-png.flaticon.com/512/1752/1752783.png",
        Gold: "https://cdn-icons-png.flaticon.com/512/1752/1752783.png",
        Diamante: "https://cdn-icons-png.flaticon.com/512/1752/1752871.png",
        Diamond: "https://cdn-icons-png.flaticon.com/512/1752/1752871.png",
        Platino: "https://cdn-icons-png.flaticon.com/512/1752/1752731.png",
        Platinum: "https://cdn-icons-png.flaticon.com/512/1752/1752731.png",
      };
      return icons[this.categoria] || icons["Bronce"];
    },
  },
};
</script>

<style scoped>
.achievement-icon {
  width: 40px;
  height: 40px;
  user-select: none;
  pointer-events: none;
}
</style> 