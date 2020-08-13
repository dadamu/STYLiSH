const addVariantButton = document.getElementById("addVariant");
const variantBox = document.getElementById("variantBox");
const size = document.getElementById("sizeSelector");
const colorName = document.getElementById("colorName");
const colorCode = document.getElementById("colorCode");
const stock = document.getElementById("stock");
const variantErrorMsg = document.getElementById("variantErrorMsg");

//add variant information
/* global document */
addVariantButton.addEventListener('click', () => {
    const newVariant = document.createElement('div');
    const newDeleteButton = document.createElement('button');
    newDeleteButton.innerText = 'X';
    newDeleteButton.addEventListener('click', deleteVriantRow);
    newVariant.className = 'variantRow';

    if (size.value != '' & colorName.value != '' & colorCode.value.length === 6 & stock.value != '') {
        newVariant.innerHTML = `${size.value};${colorName.value};${colorCode.value};${stock.value};`;
        newVariant.appendChild(newDeleteButton);
        variantBox.appendChild(newVariant);
        stock.value = "";
        variantErrorMsg.innerHTML = "";
    }
    else if (size.value == '' | colorName.value == '' | colorCode.value == '' | stock.value == '') {
        variantErrorMsg.innerHTML = "Can not be empty!";
    }
    else {
        variantErrorMsg.innerHTML = "Color code must be 6 characters!";

    }
});

//delete variant data preparing to insert
function deleteVriantRow() {
    const thisRow = this.parentElement;
    thisRow.remove();
}

