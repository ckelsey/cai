<template>
    <div class="profile-address">
        <h4 class="mt-1">Addresses</h4>
        <div class="existing-addresses">
            <address-form
                v-for="address in Addresses"
                :key="address._id"
                :model="address"
            ></address-form>
        </div>
        <div class="new-address">
            <address-form :model="newAddress"></address-form>
        </div>
    </div>
</template>

<script lang="ts" src="./profile-address.ts"></script>
