<template>
    <form class="phone-form">
        <div class="form-row">
            <div class="form-group form-row-item">
                <label>Number<span class="label-error">{{phoneNumErrorMessage}}</span></label>
                <input
                    type="tel"
                    autocomplete="tel"
                    name="tel"
                    ref="phoneNum"
                    required="true"
                    v-model="model.phoneNum"
                >
            </div>

            <div class="form-group form-row-item">
                <label>Type<span class="label-error">{{typeErrorMessage}}</span></label>
                <select
                    class="form-control"
                    v-model="model.type"
                    required="true"
                    ref="type"
                >
                    <option value="mobile">Mobile</option>
                    <option value="landline">Land line</option>
                </select>
            </div>
            <div class="form-group form-row-item">
                <label>Carrier<span class="label-error">{{carrierErrorMessage}}</span></label>
                <input
                    type="text"
                    class="form-control"
                    required="true"
                    ref="carrier"
                    v-model="model.carrier"
                >
            </div>
        </div>
        <div class="form-row">
            <div class="form-group form-row-item">
                <label>Start date<span class="label-error">{{startDateErrorMessage}}</span></label>
                <input
                    type="date"
                    class="form-control"
                    required="true"
                    ref="startDate"
                    v-model="model.startDate"
                >
            </div>
            <div class="form-group form-row-item">
                <label>End date</label>
                <input
                    type="date"
                    class="form-control"
                    v-model="model.endDate"
                >
            </div>
        </div>
        <div class="form-row">
            <div class="form-group form-row-item">
                <input
                    type="checkbox"
                    class="form-control"
                    ref="primary"
                    v-model="model.isPrimary"
                >
                <label @click="toggleCheckbox(`primary`)">Primary phone</label>
            </div>
        </div>
        <div
            class="form-row"
            v-if="model.type !== `mobile`"
        >
            <div class="form-group form-row-item">
                <label>Phone bill<span class="label-error">{{imageErrorMessage}}</span></label>
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
                    @click="savePhone($event)"
                >{{model.id? `update`:`add`}}</button>
            </div>
            <div
                class="form-group pl-4"
                v-if="model.id"
            >
                <button
                    class="btn btn-danger"
                    @click="deletePhone($event)"
                >Delete</button>
            </div>
            <div
                class="form-group pl-4 color-primary"
                v-if="verified && model.id"
            >
                <span>
                    <font-awesome-icon icon="check-circle"></font-awesome-icon>&nbsp;Verified
                </span>
            </div>
            <div
                class="form-group pl-4 color-red"
                v-if="!verified && model.id"
            >
                <button
                    class="btn btn-primary"
                    @click="verifyPhone($event)"
                >Verify number</button>
                <span class="pl-4">
                    <font-awesome-icon icon="times-circle"></font-awesome-icon>&nbsp;Not verified
                </span>
            </div>
        </div>

        <modal-content ref="verifyModal">
            <div class="verify-number-form">
                <div class="form-group">
                    <label>Verification number</label>
                    <input
                        type="number"
                        ref="verifyNumber"
                    >
                </div>
                <div class="form-group">
                    <button
                        class="btn btn-secondary"
                        @click="verifySMS($event)"
                    >Verify</button>
                </div>
            </div>
        </modal-content>
    </form>
</template>
<script lang="ts" src="./index.ts"></script>
<style lang="scss">
@import "../../global.scss";
.phone-form {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    flex-wrap: wrap;
    padding: 1rem;
    background: rgba(239, 243, 245, 0.6);
    margin: 1rem 0rem;
    box-shadow: inset 0px 0px 0px 1px rgba(186, 202, 210, 0.4);

    .verify-number-form {
        max-width: 100%;
        width: 300px;
    }
}
</style>
