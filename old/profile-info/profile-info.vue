<template>
    <div class="profile-info d-flex align-items-start has-clarence">
        <div class="profile-info-form">
            <h4 class="mt-1">Account settings</h4>
            <div
                class="form-row"
                v-for="(row, index) in formData"
                v-bind:key="index"
            >
                <div
                    class="form-row-item"
                    v-for="item in row"
                    v-bind:key="item.key"
                >
                    <div class="form-group">
                        <label>{{item.label}}<span
                                class="label-error"
                                :ref="item.key"
                            ></span></label>
                        <input
                            :type="item.type"
                            :name="item.key"
                            class="form-control"
                            v-model="item.value"
                        >
                    </div>
                </div>
            </div>

            <div class="mt-4">
                <div class="d-flex align-items-center justify-content-between">

                    <button
                        @click="submitInfo($event)"
                        class="btn btn-secondary"
                    >Save</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./profile-info.ts"></script>
<style lang="scss">
.profile-info-form {
    min-width: 250px;
    width: 100%;
}

clarence-form-helper {
    min-width: 250px;
    width: 100%;
}
</style>

