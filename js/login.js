function setId() {
    var id = document.querySelector('#id_input').value;
    var id = localStorage.setItem('id', id);
    location.href = '/';
}