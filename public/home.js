const codeInput = document.querySelector(".code__input");
const joinButton = document.querySelector(".join__button");

joinButton.addEventListener('click', () => {
    let value = codeInput.value;

    if(value.trim() === "") {
        alert('Es necesario un poner un codigo')
        return;
    }
    window.open(`/client/multi?${value}`,"_parent");
});