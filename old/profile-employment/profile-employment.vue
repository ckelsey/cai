<template>
    <div class="profile-employment">
        <h4 class="mt-1">Employment history</h4>
        <div class="existing-form">
            <form-element
                v-for="(obj, $index) in Employment"
                :key="$index"
                :model="formData(obj)"
                :confirmed="obj.confirmed"
                existing="true"
            >
            </form-element>
        </div>
        <div class="new-form">
            <form-element
                :model="formData({})"
                :submission="user.saveEmployment"
            >
            </form-element>
        </div>
    </div>
</template>

<script lang="ts" src="./profile-employment.ts"></script>
