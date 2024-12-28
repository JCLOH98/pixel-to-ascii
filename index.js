
let input_preview = document.getElementById("input-preview");
let ascii_output = document.getElementById("ascii-output");
let input_canvas = document.getElementById("input-canvas");
let output_canvas = document.getElementById("output-canvas");

// https://paulbourke.net/dataformats/asciiart/
let asciiList = "@%#*+=-:."
// let asciiList = `$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,"^\`'.`;

let file_option = {
    multiple: false,
    types: [{
        description: "image",
        accept:{
            "image/*": [],
        },
    }, {
        description: "video",
        accept: {
            "video/*": [],
        },
    }]
}

let media_content;
let resize_ratio = 1;
let max_resize_px = 500;
max_resize_px = parseInt(window.innerWidth*0.3)>max_resize_px?max_resize_px:parseInt(window.innerWidth*0.3);

const load = async () => {
    try {
        let [file_handle] = await window.showOpenFilePicker(file_option);
        let file = await file_handle.getFile();
        media_content = URL.createObjectURL(file);  // Create a URL for the file
        console.log(file.type);
        
        if (file.type=="image/gif") {
            gifToASCII(media_content);
        }
        else if (file.type.includes("image")) {
            imageToASCII(media_content)
        }
        // pixelToASCII(media_content);
    }
    catch(err) {
        console.error("upload error:",err);
        // pixelToASCII();
    }
}

const gifToASCII = (link="gifs/squirtle-saxaphone.gif") => {
    gifFrames({ url: link, frames: "all" ,outputType: "canvas"}).then(function (frameData) {
        const total_frame = frameData.length;
        let current_frame = 0;

        function drawFrame(idx=0) {
            let input_ctx = input_canvas.getContext('2d');

            let frame_canvas = frameData[idx].getImage();
            
            let resized_image = new Image();
            resized_image.src = frame_canvas.toDataURL();
            resized_image.onload = () => {
                let width = resized_image.width;
                let height = resized_image.height;
                let resize_px = Math.round(width*resize_ratio);
                resize_px = resize_px>max_resize_px?max_resize_px:resize_px;
                if (width > resize_px) {
                    const division = resize_px/width;
                    width = resize_px;
                    height = height * division;
                }
                resized_image.width = width;
                resized_image.height = height;
    
                input_canvas.width = width;
                input_canvas.height = height
        
                output_canvas.width = width;
                output_canvas.height = height;
                
                input_ctx.drawImage(resized_image,0,0,width,height);
                let resized_image_data = input_ctx.getImageData(0,0,input_canvas.width,input_canvas.height);
    
                document.getElementById("input-preview").innerHTML = "";
                document.getElementById("input-preview").appendChild(resized_image);
                ascii_output.innerText = pixelToASCII(resized_image_data.data,width);
                const output_ctx = output_canvas.getContext('2d');
                output_ctx.putImageData(resized_image_data,0,0);
            }

            setTimeout(()=>{
                if (current_frame>=(total_frame-1)) {
                    current_frame = 0;
                }
                else {
                    current_frame += 1;
                }
                drawFrame(current_frame);
            },frameData[current_frame].frameInfo.delay*10);
        }
        drawFrame(current_frame); //initial trigger
    });
}

const pixelToASCII = (pixel_data = [], width=0) => {
    let ascii_content = "";
    for (let i=0; i<pixel_data.length; i+=4) {
        let gray_px = 0.299*pixel_data[i] + 0.587*pixel_data[i+1] + 0.114*pixel_data[i+2];

        if (pixel_data[i+3] == 0) { //transparent background
            gray_px = 255;
        }

        pixel_data[i] = gray_px;
        pixel_data[i+1] = gray_px;
        pixel_data[i+2] = gray_px;

        //binning 0-255 to asciiList.length
        if (parseInt(i/4)%(width) == 0) {
            ascii_content += "\n";
        }
        ascii_content += asciiList[Math.round(gray_px/255*(asciiList.length-1))];
    }
    return ascii_content;
}

const imageToASCII = (link="images/capybara-orange.png") => {
    // get the input source
    let image = new Image();
    image.setAttribute("id","input-source-media");
    image.src = link;
    image.onload = () => {
        //resize so that it still looks ok
        let width = image.width;
        let height = image.height;
        let resize_px = Math.round(width*resize_ratio);
        resize_px = resize_px>max_resize_px?max_resize_px:resize_px;
        if (width > resize_px) {
            const division = resize_px/width;
            width = resize_px;
            height = height * division;
        }

        image.width = width;
        image.height = height;

        input_canvas.width = width;
        input_canvas.height = height

        output_canvas.width = width;
        output_canvas.height = height;

        let input_ctx = input_canvas.getContext('2d');
        input_ctx.drawImage(image,0,0,width,height);
        input_preview.innerHTML = "";
        input_preview.appendChild(image);

        const image_data = input_ctx.getImageData(0,0,width,height)
        const pixel_data = image_data.data;
        // console.log(image_data);
        // console.log(pixel_data);
        // console.log(pixel_data.length/4); // r,g,b,a (alpha is transparency);

        // check if enable color
        // rgb to gray formula 
        //0.299 ∙ Red + 0.587 ∙ Green + 0.114 ∙ Blue
        ascii_output.innerText = pixelToASCII(pixel_data, width);

        // convert it to ascii
        // show to output
        const output_ctx = output_canvas.getContext('2d');
        output_ctx.putImageData(image_data,0,0);
    }
}

// imageToASCII();
gifToASCII();
document.getElementById("load-button").addEventListener("click", load);

