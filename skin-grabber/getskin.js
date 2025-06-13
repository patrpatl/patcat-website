document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('skinForm');
    const output = document.getElementById('output');
    const errorDiv = document.getElementById('error');
    const clearBtn = document.getElementById('clearBtn');
    const usernameInput = document.getElementById('username');
    const avatarImg = document.getElementById('avatarImg');
    const bigcenter = document.getElementById('bigcenter');
    let lastQueriedUsername = '';
    let typingTimer;
    const doneTypingInterval = 1500; // ms

    async function fetchAndDisplaySkin(username) {
        output.innerHTML = '';
        errorDiv.textContent = '';
        if (!username) {
            output.innerHTML = '';
            if (bigcenter) bigcenter.innerHTML = "Minecraft Skin Grabber";
            return;
        }
        output.innerHTML = '<div class="d-flex justify-content-center my-4"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
        try {
            // Get UUID
            let userRes;
            try {
                userRes = await fetch('https://corsproxy.io/?https://api.mojang.com/users/profiles/minecraft/' + encodeURIComponent(username));
            } catch (networkErr) {
                throw new Error('Network error: Unable to reach Mojang API. Please check your connection or try again later.');
            }
            if (userRes.status === 429) {
                throw new Error('CORSProxy limit reached. Please wait a few minutes before trying again.');
            }
            if (userRes.status === 403) {
                    document.getElementById('403msg').hidden = false;
                    setTimeout(()=>{
                        document.getElementById('403msg').hidden = true;
                    }, 10000);
            }
            if (!userRes.ok) throw new Error('User not found');
            const userData = await userRes.json().catch(() => null);
            if (!userData || userData.error || !userData.id) throw new Error('User not found');
            // Set IGN in bigcenter
            if (bigcenter && userData.name) {
                bigcenter.innerHTML = userData.name;
            }
            // Get skin data
            let profileRes;
            try {
                profileRes = await fetch('https://corsproxy.io/?https://sessionserver.mojang.com/session/minecraft/profile/' + userData.id);
            } catch (networkErr) {
                throw new Error('Network error: Unable to fetch skin data. Please check your connection or try again later.');
            }
            if (profileRes.status === 429) {
                throw new Error('CORSProxy limit reached. Please wait a few minutes before trying again.');
            }
            if (!profileRes.ok) throw new Error('Could not fetch skin data');
            const profileData = await profileRes.json();
            const prop = profileData.properties && profileData.properties[0];
            if (!prop || !prop.value) throw new Error('No skin data found.');
            const playerData = JSON.parse(atob(prop.value));
            let skinUrl = playerData.textures && playerData.textures.SKIN ? playerData.textures.SKIN.url : null;
            let capeUrl = playerData.textures && playerData.textures.CAPE ? playerData.textures.CAPE.url : null;
            // Ensure URLs use https
            if (skinUrl && skinUrl.startsWith('http://')) {
                skinUrl = skinUrl.replace('http://', 'https://');
            }
            if (capeUrl && capeUrl.startsWith('http://')) {
                capeUrl = capeUrl.replace('http://', 'https://');
            }
            if (!skinUrl) {
                output.innerHTML = '<div class="alert alert-warning text-center">No skin found.</div>';
                return;
            }
            let html = `
                <div class="card mb-3">
                    <div class="card-body d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
                        <div class="text-center flex-grow-1" style="min-width: 120px;">
                            <h6 class="card-title fw-bold mb-2">Skin</h6>
                            <img class="img-fluid rounded shadow-sm mb-2" src="${skinUrl}" alt="Skin" style="max-width:120px;">
                        </div>
                        <div class="d-flex flex-column align-items-center align-items-md-end">
                            <button type="button" class="btn btn-success mt-2 w-100" id="downloadSkinBtn">
                                <span class="material-icons align-middle me-1">file_download</span>Download Skin
                            </button>
                        </div>
                    </div>
                </div>
                `;
            if (capeUrl) {
                html += `
                    <div class="card mb-3">
                        <div class="card-body d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
                            <div class="text-center flex-grow-1" style="min-width: 80px;">
                                <h6 class="card-title fw-bold mb-2">Cape</h6>
                                <img class="img-fluid rounded shadow-sm mb-2" src="${capeUrl}" alt="Cape" style="max-width:80px;">
                            </div>
                            <div class="d-flex flex-column align-items-center align-items-md-end">
                                <button type="button" class="btn btn-info mt-2 w-100" id="downloadCapeBtn">
                                    <span class="material-icons align-middle me-1">file_download</span>Download Cape
                                </button>
                            </div>
                        </div>
                    </div>
                    `;
            }
            output.innerHTML = html;

            // Download Skin Button
            const downloadSkinBtn = document.getElementById('downloadSkinBtn');
            if (downloadSkinBtn && skinUrl) {
                downloadSkinBtn.addEventListener('click', function () {
                    fetch(skinUrl)
                        .then(res => res.blob())
                        .then(blob => {
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            // Use the exact username casing from Mojang API if available
                            let downloadName = 'skin';
                            if (userData && userData.name) {
                                downloadName = userData.name;
                            }
                            a.download = downloadName + '.png';
                            document.body.appendChild(a);
                            a.click();
                            setTimeout(() => {
                                URL.revokeObjectURL(url);
                                a.remove();
                            }, 100);
                        });
                });
            }
            // Download Cape Button
            const downloadCapeBtn = document.getElementById('downloadCapeBtn');
            if (downloadCapeBtn && capeUrl) {
                downloadCapeBtn.addEventListener('click', function () {
                    fetch(capeUrl)
                        .then(res => res.blob())
                        .then(blob => {
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            let downloadName = 'cape';
                            if (userData && userData.name) {
                                downloadName = userData.name + '-cape';
                            }
                            a.download = downloadName + '.png';
                            document.body.appendChild(a);
                            a.click();
                            setTimeout(() => {
                                URL.revokeObjectURL(url);
                                a.remove();
                            }, 100);
                        });
                });
            }
        } catch (err) {
            output.innerHTML = '';
            if (bigcenter) bigcenter.innerHTML = "Minecraft Skin Grabber";
            if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
                errorDiv.textContent = 'Network error: Unable to connect to the API. Please check your internet connection or try again later.';
            } else if (err.message && err.message.includes('CORSProxy limit reached')) {
                errorDiv.textContent = err.message;
            } else {
                errorDiv.textContent = err.message || 'An error occurred. Please try again.';
            }
        }
    }

    // Only fetch skin and update avatar after user stops typing for 1.5 seconds or submits
    function updateAvatarAfterTyping(username) {
        if (!username) {
            avatarImg.src = "https://crafatar.com/avatars/8667ba71b85a4004af54457a9734eed7?size=72&overlay";
            avatarImg.alt = "Steve";
            if (bigcenter) bigcenter.innerHTML = "Minecraft Skin Grabber";
            return;
        }
        fetch('https://corsproxy.io/?https://api.mojang.com/users/profiles/minecraft/' + encodeURIComponent(username))
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && data.id) {
                    avatarImg.src = "https://crafatar.com/avatars/" + encodeURIComponent(data.id) + "?size=72&overlay";
                    avatarImg.alt = username + "'s avatar";
                    if (bigcenter && data.name) {
                        bigcenter.innerHTML = data.name;
                    }
                } else {
                    avatarImg.src = "https://crafatar.com/avatars/8667ba71b85a4004af54457a9734eed7?size=72&overlay";
                    avatarImg.alt = "Steve";
                    if (bigcenter) bigcenter.innerHTML = "Minecraft Skin Grabber";
                }
            })
            .catch(() => {
                avatarImg.src = "https://crafatar.com/avatars/8667ba71b85a4004af54457a9734eed7?size=72&overlay";
                avatarImg.alt = "Steve";
                if (bigcenter) bigcenter.innerHTML = "Minecraft Skin Grabber";
            });
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const username = usernameInput.value.trim();
        lastQueriedUsername = username;
        fetchAndDisplaySkin(username);
        updateAvatarAfterTyping(username);
    });

    usernameInput.addEventListener('input', function () {
        clearTimeout(typingTimer);
        const username = usernameInput.value.trim();
        if (!username) {
            output.innerHTML = '';
            errorDiv.textContent = '';
            lastQueriedUsername = '';
            avatarImg.src = "https://crafatar.com/avatars/8667ba71b85a4004af54457a9734eed7?size=72&overlay";
            avatarImg.alt = "Steve";
            if (bigcenter) bigcenter.innerHTML = "Minecraft Skin Grabber";
            return;
        }
        typingTimer = setTimeout(function () {
            if (username !== lastQueriedUsername) {
                lastQueriedUsername = username;
                fetchAndDisplaySkin(username);
                updateAvatarAfterTyping(username);
            }
        }, doneTypingInterval);
    });

    usernameInput.addEventListener('keydown', function () {
        clearTimeout(typingTimer);
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            usernameInput.value = '';
            output.innerHTML = '';
            errorDiv.textContent = '';
            lastQueriedUsername = '';
            avatarImg.src = "https://crafatar.com/avatars/8667ba71b85a4004af54457a9734eed7?size=72&overlay";
            avatarImg.alt = "Steve";
            if (bigcenter) bigcenter.innerHTML = "Minecraft Skin Grabber";
        });
    }
});