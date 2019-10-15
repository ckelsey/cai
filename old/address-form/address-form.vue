<template>
    <form class="address-form">
        <div class="form-row">
            <div class="form-group form-row-item">
                <label>Street<span class="label-error">{{streetErrorMessage}}</span></label>
                <input
                    type="text"
                    autocomplete="street-address"
                    name="street-address"
                    ref="streetInput"
                    required="true"
                    v-model="model.street"
                >
            </div>
        </div>
        <div class="form-row">
            <div class="form-group form-row-item">
                <label>City<span class="label-error">{{cityErrorMessage}}</span></label>
                <input
                    type="text"
                    autocomplete="city"
                    name="city"
                    ref="cityInput"
                    required="true"
                    v-model="model.city"
                >
            </div>

            <div class="form-group form-row-item">
                <label>State/region<span class="label-error">{{stateErrorMessage}}</span></label>
                <select
                    class="form-control"
                    v-model="model.state"
                    required="true"
                    ref="stateInput"
                >
                    <option
                        v-for="(state, index) in States"
                        :key="index"
                        :value="index"
                    >{{state}}</option>
                </select>
            </div>
            <div class="form-group form-row-item">
                <label>County<span class="label-error">{{countyErrorMessage}}</span></label>
                <input
                    type="text"
                    class="form-control"
                    required="true"
                    ref="countyInput"
                    v-model="model.county"
                >
            </div>
            <div class="form-group form-row-item">
                <label>Zip<span class="label-error">{{zipErrorMessage}}</span></label>
                <input
                    type="number"
                    class="form-control"
                    required="true"
                    ref="zipInput"
                    v-model="model.zip"
                >
            </div>
            <div class="form-group form-row-item">
                <label>Country<span class="label-error">{{countryErrorMessage}}</span></label>
                <input
                    type="text"
                    class="form-control"
                    required="true"
                    ref="countryInput"
                    v-model="model.country"
                >
            </div>

        </div>
        <div class="form-row">
            <div class="form-group form-row-item">
                <label>Move in date<span class="label-error">{{startDateErrorMessage}}</span></label>
                <input
                    type="date"
                    class="form-control"
                    required="true"
                    ref="startDate"
                    v-model="model.startDate"
                >
            </div>
            <div class="form-group form-row-item">
                <label>Move out date</label>
                <input
                    type="date"
                    class="form-control"
                    v-model="model.endDate"
                >
            </div>
            <div class="form-group form-row-item">
                <input
                    type="checkbox"
                    class="form-control"
                    ref="primary"
                    v-model="model.isPrimary"
                >
                <label @click="toggleCheckbox(`primary`)">Primary address</label>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group form-row-item">
                <label>Utility bill<span class="label-error">{{imageErrorMessage}}</span></label>
                <input
                    type="file"
                    ref="imageInput"
                    required="true"
                >
            </div>
        </div>
        <div class="d-flex align-items-center">
            <div class="form-group">
                <button
                    class="btn btn-secondary"
                    @click="saveAddress($event)"
                >{{model._id? `update`:`add`}}</button>
            </div>
            <div
                class="form-group pl-4"
                v-if="model._id"
            >
                <button
                    class="btn btn-danger"
                    @click="deleteAddress($event)"
                >Delete</button>
            </div>
            <div
                class="form-group pl-4 color-primary"
                v-if="verified && model._id"
            >
                <span>
                    <font-awesome-icon icon="check-circle"></font-awesome-icon>&nbsp;Verified
                </span>
            </div>
            <div
                class="form-group pl-4 color-red"
                v-if="!verified && model._id"
            >
                <span class="pl-4">
                    <font-awesome-icon icon="times-circle"></font-awesome-icon>&nbsp;Not verified
                </span>
            </div>
        </div>
    </form>
</template>
<script lang="ts" src="./address-form.ts"></script>
<style lang="scss">
@import "../../global.scss";
.address-form {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    flex-wrap: wrap;
    padding: 1rem;
    background: rgba(239, 243, 245, 0.6);
    margin: 1rem 0rem;
    box-shadow: inset 0px 0px 0px 1px rgba(186, 202, 210, 0.4);
}
</style>
