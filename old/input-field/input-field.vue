<template>
    <span class="input-field">
        <input
            class="input-field-input"
            :type="Type"
            :name="name"
            :id="id"
            v-model="proxy"
        >
        <span class="input-field-mask">{{proxy}}</span>
    </span>
</template>
<script lang="ts" src="./input-field.ts"></script>
<style lang="scss"></style>
