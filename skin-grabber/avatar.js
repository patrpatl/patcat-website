(function () {
    function getCookie(name) {
        const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
        return v ? decodeURIComponent(v.pop()) : null;
    }
    document.addEventListener('DOMContentLoaded', function () {
        const usernameInput = document.getElementById('username');
        const avatarImg = document.getElementById('avatarImg');
        const form = document.getElementById('skinForm');
        let lastUsername = '';

        async function updateAvatar(username) {
            if (!username) {
                avatarImg.src = "https://crafatar.com/avatars/8667ba71b85a4004af54457a9734eed7?size=72&overlay";
                avatarImg.alt = "Steve";
                return;
            }
            // Use Crafatar for fast avatar (requires UUID, not username)
            try {
                const res = await fetch('https://corsproxy.io/?https://api.mojang.com/users/profiles/minecraft/' + encodeURIComponent(username));
                if (res.ok) {
                    const data = await res.json();
                    avatarImg.src = "https://crafatar.com/avatars/" + encodeURIComponent(data.id) + "?size=72&overlay";
                    avatarImg.alt = username + "'s avatar";
                } else {
                    avatarImg.src = "https://crafatar.com/avatars/8667ba71b85a4004af54457a9734eed7?size=72&overlay";
                    avatarImg.alt = "Steve";
                }
            } catch {
                avatarImg.src = "https://crafatar.com/avatars/8667ba71b85a4004af54457a9734eed7?size=72&overlay";
                avatarImg.alt = "Steve";
            }
        }

        usernameInput.addEventListener('input', function () {
            const username = usernameInput.value.trim();
            if (username !== lastUsername) {
                lastUsername = username;
                clearTimeout(window.avatarTypingTimer);
                window.avatarTypingTimer = setTimeout(function () {
                    updateAvatar(username);
                }, 800);
            }
        });

        // Also update on submit in case user pastes and submits quickly
        form.addEventListener('submit', function (e) {
            const username = usernameInput.value.trim();
            updateAvatar(username);
        });

        // Reset to Steve on clear
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                avatarImg.src = "https://static.wikia.nocookie.net/minecraft_gamepedia/images/6/6e/Steve.png";
                avatarImg.alt = "Steve";
            });
        }
    });
})();