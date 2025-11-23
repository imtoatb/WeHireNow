<script setup>
import { useAuthStore } from "../stores/auth";
const auth = useAuthStore();

</script>



<template>
    <div class="header-profil">
        <img src="" alt="Profile Picture" class="profile-picture" />
        <img src="" alt="Background Image" class="background-image" />
        <h1>{{First_name}} {{ Last_name }}</h1>
    </div>

    <div class="profil-details">

        <div>
            <h1>Bienvenue {{ auth.user.email }}</h1>
            <p>Type : {{ auth.user.account_type }}</p>
        </div>

        <div class = "bio">
            <h2>About Me</h2>
            <p>{{ Bio }}</p>
        </div>

        <div class="contact-info">
            <h2>Contact Information</h2>
            <p>Email: {{ Email }}</p>
            <p>Phone: {{ Phone }}</p>
            <p>Linkedin {{Linkedin}}</p>
            <p>GitHub: {{GitHub}}</p>

        </div>

        <div class="skills-experience">
            <h2>Skills</h2>
            <ul>
                <li v-for="skill in Skills" :key="skill">{{ skill }}</li>
            </ul>

            <h2>Experience</h2>
            <div v-for="experience in Experiences" :key="experience.id" class="experience-item">
                <h3>{{ experience.position }} at {{ experience.company }}</h3>
                <p>{{ experience.duration }}</p>
                <p>{{ experience.description }}</p>
            </div>
        </div>

        <div class="education">
            <h2>Education</h2>
            <div v-for="education in Educations" :key="education.id" class="education-item">
                <h3>{{ education.degree }} from {{ education.institution }}</h3>
                <p>{{ education.duration }}</p>
                <p>{{ education.description }}</p>
            </div>
        </div>

        <div class="Activity">
            <h2>Activities</h2>
            <div v-for="activity in Activities" :key="activity.id" class="activity-item">
                <h3>{{ activity.name }}</h3>
                <p>{{ activity.duration }}</p>
                <p>{{ activity.description }}</p>
            </div>
        </div>

    </div>



</template>

