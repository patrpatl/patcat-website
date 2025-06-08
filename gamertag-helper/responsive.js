document.addEventListener('DOMContentLoaded', function () {
    if (!localStorage.getItem('skinGrabberWarningShown')) {
        var warningModal = new bootstrap.Modal(document.getElementById('warningModal'));
        warningModal.show();
        document.getElementById('warningModal').addEventListener('hidden.bs.modal', function () {
            localStorage.setItem('skinGrabberWarningShown', '1');
        });
    }
});