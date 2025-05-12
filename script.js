let currentAudio = null;
let songs = [];
let songlst = [];
let idno = -1;
let audiotime;
let trackname;
let currfolder;
let activeItem = null;
let songData = [];

function formatesongname(name) {
    return name.replaceAll("%20", " ")
        .replace("320 Kbps.mp3", ".")
        .replace("128 Kbps", ".")
        .replace(".mp3", ".")
        .replace("- PaagalWorld.Com.Se", " Masoom Sharma ")
        .replace("_", " ");
}

async function updateUI(id) {
    let list = document.querySelectorAll(".listsong");
    for (let i = 0; i < list.length; i++) {
        let song = list[i].querySelector(".songname");
        let songplayimg = list[i].querySelector(".playbtnimg");

        if (song) song.style.animation = "none";
        if (songplayimg) songplayimg.src = "tool/playbar.svg";
    }

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    let listitem = list[id];
    let song = listitem.querySelector(".songname");
    let imgplay = listitem.querySelector(".playbtnimg");

    idno = id;

    currentAudio = new Audio(`songs/${currfolder}/${songlst[idno]}`);
    currentAudio.volume = document.getElementById("vlmrange").value; // 🔥 Fixed volume
    currentAudio.play();

    currentAudio.addEventListener("ended", async () => {
        document.getElementById("play").src = "tool/playbar.svg";
        if (idno < songlst.length - 1) {
            idno++;
            await updateUI(idno);
        } else {
            currentAudio = null;
            activeItem = null;
        }
    });

    trackname = formatesongname(songlst[idno]);

    if (song && imgplay) {
        song.style.animation = "textanime 10s linear infinite";
        document.querySelector(".playbar").style.display = "flex";
        imgplay.src = "tool/pause.svg";
        document.getElementById("play").src = "tool/pause.svg"
        document.querySelector(".songtext").innerHTML = trackname;
    }

    currentAudio.addEventListener("timeupdate", () => {
        let cur = currentAudio.currentTime;
        let dur = currentAudio.duration;

        let curMin = Math.floor(cur / 60);
        let curSec = String(Math.floor(cur % 60)).padStart(2, '0');
        let percentage = (cur / dur) * 100;
        let durMin = Math.floor(dur / 60);
        let durSec = String(Math.floor(dur % 60)).padStart(2, '0');

        document.querySelector(".songtime").innerText = `${curMin}:${curSec} / ${durMin}:${durSec}`;
        document.querySelector(".circle").style.left = `${percentage}%`;
        document.querySelector(".seekbar").style.background = `linear-gradient(to right, Gray ${percentage}%, Black ${percentage}%)`;
    });

    activeItem = listitem;
}

async function main() {

    const res = await fetch("info.json");
    const json = await res.json();
    songData = json.songs;

    const foldercont = document.querySelector(".cardcont");
    const lastcont = document.querySelector(".lastcont");

    songData.forEach((folder, index) => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
        <div class="cardimg">
            <img src="songs/${folder.folder_name}/img${index + 1}.jpg" id="cardimgid" alt="card img">
            <div class="play">
                <img src="tool/play.svg" class="playsvg" alt="card image">
            </div>
        </div>
        <span class="span1 spanbox">${folder.folder_name}</span>
    `;
        foldercont.insertBefore(card, lastcont);
    });



    foldercont.addEventListener("click", async (e) => {
        let folderCard = e.target.closest(".card");

        if (!folderCard) return;

        const folderName = folderCard.querySelector(".span1").innerText;
        currfolder = folderName;
        const selectedFolder = songData.find(f => f.folder_name === folderName);
        if (!selectedFolder) return;

        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        }

        songs = [];
        songlst = selectedFolder.song_name;
        idno = -1;

        document.querySelectorAll(".play").forEach(btn => {
            btn.removeAttribute("id");
            const icon = btn.querySelector(".playsvg");
            if (icon) icon.src = "tool/play.svg";
        });

        document.querySelector(".songslist ul").innerHTML = "";
        document.querySelector(".playbar").style.display = "none";

        const ul = document.querySelector(".songslist ul");
        songlst.forEach(song => {
            ul.innerHTML += `
            <li class="listsong" data-filename="${song}">
                <img src="tool/music.svg" class="musicimg" alt="music image">
                <div class="musicinfo">
                    <div class="songname">
                        <p class="tracknamep">${formatesongname(song)}</p>
                    </div>
                </div>
                <span>Play</span>
                <img src="tool/playbar.svg" alt="play button image" class="playbtnimg">
            </li>`;
        });
        const playbtn = folderCard.querySelector(".play");
        if (playbtn) playbtn.id = "playafter";

        if (e.target.closest(".play")?.id === "playafter") {
            await updateUI(0);
            const icon = e.target.closest(".play").querySelector(".playsvg");
            if (icon) icon.src = "tool/pausebar.svg";
        }



    });

    document.querySelector(".songslist").addEventListener("click", async (e) => {
        let listitem = e.target.closest(".listsong");
        if (!listitem) return;

        if (listitem === activeItem) {
            let song = listitem.querySelector(".songname");
            let imgplay = listitem.querySelector(".playbtnimg");
            if (song) song.style.animation = "none";
            if (imgplay) imgplay.src = "tool/playbar.svg";
            document.getElementById("play").src = "tool/playbar.svg";
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
            }
            activeItem = null;
            currentAudio = null;
            return;
        }

        let songid = listitem.getAttribute("data-filename");
        idno = songlst.indexOf(songid);
        if (idno !== -1) await updateUI(idno);
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        if (!currentAudio || !currentAudio.duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickx = e.clientX - rect.left;
        const width = e.currentTarget.offsetWidth;
        const percentage = (clickx / width) * 100;

        currentAudio.currentTime = (percentage / 100) * currentAudio.duration;
        document.querySelector(".circle").style.left = `${percentage}%`;
    });

    document.getElementById("play").addEventListener("click", () => {
        if (!currentAudio) return;
        if (currentAudio.paused) {
            currentAudio.play();
            document.getElementById("play").src = "tool/pause.svg";
        } else {
            currentAudio.pause();
            document.getElementById("play").src = "tool/playbar.svg";
        }
    });

    document.getElementById("previous").addEventListener("click", async () => {
        if (idno > 0) {
            idno--;
            if (currentAudio) currentAudio.pause();
            await updateUI(idno);
        }
    });

    document.getElementById("next").addEventListener("click", async () => {
        if (idno < songlst.length - 1) {
            idno++;
            if (currentAudio) currentAudio.pause();
            await updateUI(idno);
        }
    });







}

function clickleft() {

    document.querySelector(".cardcont").addEventListener("click", (e) => {
        const cardClicked = e.target.closest(".card");
        document.querySelector(".left").classList.add("active");
        console.log("Hello");
    });

    let library = document.querySelector(".librarybtn");
    let left = document.querySelector(".left");
    let playlayout = document.querySelector(".playbar");

    library.addEventListener("click", (e) => {
        left.classList.add("active");
        e.stopPropagation();
    });

    document.addEventListener("click", (e) => {
        if (
            !left.contains(e.target) &&
            !library.contains(e.target) &&
            !playlayout.contains(e.target) &&
            !e.target.closest(".card") // <-- this line added
        ) {
            left.classList.remove("active");
        }
    });

    document.querySelector(".createplaylist").addEventListener("click", () => {
        left.classList.remove("active");
    });

    let inputtxt = document.getElementById("inputtxt");
    inputtxt.addEventListener("input", () => {
        if (inputtxt.value !== "") {
            inputtxt.style.backgroundColor = "rgb(20,20,20)";
        }
    });

    let volumeslidebar = document.getElementById("vlmrange");
    volumeslidebar.addEventListener("input", () => {
        if (currentAudio) currentAudio.volume = volumeslidebar.value;
    });

    let volumeicon = document.getElementById("vlm");
    volumeicon.addEventListener("click", () => {
        if (volumeicon.src.includes("volume.svg")) {
            volumeicon.src = "tool/mute.svg";
            if (currentAudio) currentAudio.volume = 0;
        } else {
            volumeicon.src = "tool/volume.svg";
            if (currentAudio) currentAudio.volume = volumeslidebar.value;
        }
    });
}


main();
clickleft();
