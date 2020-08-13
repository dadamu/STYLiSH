/* global document */
const mainImagePreview = document.getElementById("mainImagePreview");
const otherPreviewDiv = document.getElementById('otherPreviewDiv');
var mainImage = document.getElementById("mainImage");
var otherImages = document.getElementById("otherImages");

mainImage.addEventListener('change', () => {
    const image = mainImage.files[0];
    mainImagePreview.src = URL.createObjectURL(image);
});

otherImages.addEventListener('change', () => {
    otherPreviewDiv.innerHTML = "";
    const images = otherImages.files;
    for (let i = 0; i < images.length; i++) {
        let previewImageBox = document.createElement('img');
        previewImageBox.className = "img_preview";
        previewImageBox.src = URL.createObjectURL(images[i]);
        otherPreviewDiv.appendChild(previewImageBox);
    }
});