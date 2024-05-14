<template>
    <div class="login-overlay">
        <div class="login-modal">
            <button class="btn-primary mb-3 btn-close" type="button" @click="closeModal()"></button>
            <p class="modal-header">Delete Grid</p>
            <p>Are you sure you want to delete this grid? This action is irreversible.</p>
            <div style="display: flex; justify-content: space-evenly; gap: 5px; margin-top: 50px;">
                <button @click="closeModal()" class="btn btn-primary mb-3 btn-yellow" type="button" style="flex: 1">
                    Cancel
                </button>
                <button @click="deleteGrid" class="btn btn-primary mb-3 btn-orange" type="button" style="flex: 1">
                    Delete
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineEmits } from "vue";
const emit = defineEmits(["close", "delete"]);

function closeModal() {
    emit("close");
}

function deleteGrid() {
    emit("delete");
    closeModal();
}
</script>

<style scoped>
.login-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.login-modal {
    background-color: rgb(255, 255, 255);
    padding: 40px 30px;
    border-radius: 30px;
    width: 400px;
}

.btn {
    font-size: 16px;
    border-radius: 40px;
}

.btn-orange {
    background-color: #d95b00;
    border-color: #d95b00;
    color: white;
}

.btn-yellow {
    border-color: #fbc46a;
    color: #fbc46a;
    background-color: rgb(248, 248, 248);
}

.modal-header {
    margin-bottom: 40px;
    font-size: 32px;
    font-weight: 500;
    justify-content: center;
    align-items: center;
}

.btn-close {
    background-color: transparent;
    border: none;
    color: black;
    font-size: 1.5em;
    position: absolute;
    right: 10px;
    top: 10px;
}

.btn-close::before {
    content: "×";
}

.btn-close:hover {
    cursor: pointer;
}

.btn-close:focus {
    outline: none;
}

.btn-close:active {
    transform: scale(0.9);
}

.btn-close:focus-visible {
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.5);
}

.btn-close:focus-visible::before {
    content: "×";
}

.btn-close:focus-visible:hover {
    cursor: pointer;
}

.btn-close:focus-visible:active {
    transform: scale(0.9);
}

.btn-close:focus-visible:focus-visible {
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.5);
}
</style>