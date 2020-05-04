const applicationServerPublicKey = 'BKU1P3Xq-JJMxQI5T4H5kteSxri6RRnusQxsP-qrwIqWxEzaT5xMIxUkWUNB3wjGg_2SVMeN9W5vR2nHxkQYLjQ';
const saveSubscription = async subscription => {
    const SERVER_URL = 'https://tapp.volcanoyt.com/sub'
    const response = await fetch(SERVER_URL, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription),
    })
    return response.json()
}
const revSubscription = async subscription_id => {
    const SERVER_URL = 'https://tapp.volcanoyt.com/unsub?id=' + subscription_id
    const response = await fetch(SERVER_URL, {
        method: 'GET'
    })
    return response.json()
}
const requestNotificationPermission = async (batal) => {
    if (!('serviceWorker' in navigator)) {
        return {
            type: 'error',
            title: 'No Service Worker support!'
        }
    }
    if (!('PushManager' in window)) {
        return {
            type: 'error',
            title: 'No Push API Support!'
        }
    }
    if (batal == "UnSubscribe") {
        return await unsubscribe();
    } else {
        const permission = await window.Notification.requestPermission();
        // value of permission can be 'granted', 'default', 'denied'
        // granted: user has accepted the request
        // default: user has dismissed the notification permission popup by clicking on x
        // denied: user has denied the request.
        if (permission !== 'granted') {
            return {
                type: 'error',
                title: 'Subscribed: ' + permission
            }
        } else {
            return await subscribe();
        }
    }
}
const AskNotif = async (txt = 'Subscribe') => {
    var txtp = "Want to get info volcano,earthquake,extreme weather on your desktop and phone quickly?";
    if (txt == "UnSubscribe") {
        txtp = "Already, want to cancel subscribe?";
    }
    await Swal.queue([{
        title: 'Disaster Notification (BETA)',
        confirmButtonText: txt,
        text: txtp,
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            return await requestNotificationPermission(txt).then(response => Swal.insertQueueStep(response))
        }
    }])
}
var subp;
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(function (c) {
        subp = c;
        console.log('ServiceWorker registration successful with scope:', c.scope);
    }).catch(function (e) {
        console.log('ServiceWorker registration failed:', e);
    });
}
function Ask() {
    try {
        subp.pushManager.getSubscription().then(function (subscription) {
            if (subscription) {
                AskNotif('UnSubscribe');
            } else {
                AskNotif();
            }

        })
    } catch (e) {
        console.warn('Error during getSubscription()', e);
        Swal.fire({
            type: 'error',
            title: 'Oops...',
            text: 'Something went wrong!'
        })
    }
}
function subscribe() {
    return new Promise(resolve => {
        const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
        subp.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
        })
            .then(async function (subscription) {
                if (subscription) {
                    var data = await saveSubscription(subscription);
                    console.log(data);
                    resolve({
                        title: data.status
                    })
                } else {
                    resolve({
                        type: 'error',
                        title: 'Faild Subscribed'
                    })
                }
            })
            .catch(function (e) {
                console.error('Unable to subscribe to push', e);
                resolve({
                    type: 'error',
                    title: 'Unable subscribed'
                })
            })

    });
}
function unsubscribe() {
    return new Promise(resolve => {

        subp.pushManager.getSubscription().then(
            async function (z) {
                if (!z) {
                    resolve({
                        type: 'error',
                        title: 'Not yet subscribed'
                    })
                }

                //var temp = z.endpoint.split("/");
                //var registration_id = temp[temp.length - 1];
                var p = await revSubscription(z.endpoint);
                console.log(p);
                if (p.code == 200) {
                    resolve({
                        title: 'Unsubscribed Done'
                    })
                } else {
                    resolve({
                        type: 'error',
                        title: p.status
                    })
                }

                //force
                z.unsubscribe().then(function (successful) {
                    console.log("Ub: ", successful);
                }).catch(function (e) {
                    console.error('Error thrown while unsbscribing from push messaging.', e);
                });

            }).catch(function (e) {
                console.log(e);
                resolve({
                    type: 'error',
                    title: 'Error while pushManager'
                })
            });
    });
}
function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}