<template>
  <header class="navbar">
    <div class="logo">WeHireNow</div>
    <nav class="nav-buttons">
      <RouterLink to="/mainpage" class="nav-link">Home</RouterLink>
      <RouterLink to="/login" class="nav-link">Login</RouterLink>
      <RouterLink to="/register" class="nav-link">Register</RouterLink>
    </nav>
  </header>
</template>

<script>
export default {
  name: "HeaderBar",
};
</script>
