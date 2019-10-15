<template>
    <div class="profile-phone">
        <h4 class="mt-1">Phone numbers</h4>
        <div class="existing-phones">
            <phone-form
                v-for="phone in Phones"
                :key="phone.id"
                :model="phone"
            ></phone-form>
        </div>
        <div class="new-phones">
            <phone-form :model="newPhone"></phone-form>
        </div>
    </div>
</template>

<script lang="ts" src="./profile-phone.ts"></script>
