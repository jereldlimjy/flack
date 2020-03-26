const namecheck = /^[0-9a-zA-Z]+$/;

document.addEventListener('DOMContentLoaded', channels);
document.addEventListener('DOMContentLoaded', messages);

document.addEventListener('DOMContentLoaded', () => {

	if (!localStorage.getItem('name')) {
		do {
			var name = prompt("Enter your display name below:");
		}
		while (!namecheck.test(name) || name === null);

		localStorage.setItem('name', name);
	}

	else {
		var name = localStorage.getItem('name');
	}

	document.querySelector('.navbar-text').innerHTML += `${name}`;
});

function messages() {
	const request = new XMLHttpRequest;
	request.open('POST', '/messages');
	request.onload = () => {

		const data = JSON.parse(request.responseText);

		for (var i = 0; i < data.length; i++) {
			var message = document.createElement('div');
			message.innerHTML = `<b>${data[i].name}</b> (${data[i].date})<br> ${data[i].message}`;
			message.className = "message";

		document.querySelector(`#v-pills-${data[i].channel}`).append(message);
		};
	};

	request.send();
};

function channels() {
	const request = new XMLHttpRequest;
	request.open('POST', '/channels');
	request.onload = () => {
		const data = JSON.parse(request.responseText);
		data.forEach(add_channel);
	};

	request.send();	
};

function add_channel(contents) {
	const channel = document.createElement('a');
	channel.innerHTML = '#&nbsp&nbsp' + contents;
	channel.className = "nav-link mb-1";
	channel.id = `v-pills-${contents}-tab`;
	channel.role = "tab";
	channel.setAttribute("aria-selected", false);
	channel.setAttribute("data-channel", `${contents}`);
	channel.href = `#v-pills-${contents}`;
	channel.setAttribute("data-toggle", "pill");
	channel.setAttribute("aria-controls", `v-pill-${contents}`);

	channel.onclick = function() {
		document.querySelector('#title').innerHTML = channel.innerText;
		localStorage.setItem('on', contents);
	}

	const tab = document.createElement('div');
	tab.className = "tab-pane fade";
	tab.id = `v-pills-${contents}`;
	tab.role = "tabpanel";
	tab.setAttribute("aria-labelledby", `v-pills-${contents}-tab`);
	document.querySelector("#v-pills-tabContent").append(tab);

	var on = localStorage.getItem('on');

	if (contents === on) {
		channel.classList.add('active');
		tab.classList.add('active', 'show');
		document.querySelector('#title').innerHTML = channel.innerText;
	};

	document.querySelector('#v-pills-tab').append(channel);
};

document.addEventListener('DOMContentLoaded', () => {

	// Connect to websocket
	var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

	// When connected, configure buttons
	socket.on('connect', () => {
		document.querySelector('form').onsubmit = () => {
			const channel = document.querySelector('#channel').value;
			socket.emit('create channel', {'channel': channel});

			document.querySelector('#channel').value = "";

			return false;
		};

		document.querySelector('#message').onsubmit = () => {
			const message = document.querySelector('#text').value;
			const name = localStorage.getItem('name');
			const date = new Date().toLocaleString(undefined, {
				day: 'numeric',
				month: 'numeric',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			});

			socket.emit('send message', {'name': name, 'message': message, 'date': date, 'channel': localStorage.getItem('on')});

			document.querySelector('#text').value = '';

			return false;
		};
	});

	socket.on('channel created', data => {
		add_channel(data.channel);
	});

	socket.on('channel taken', () => {
		alert('Channel name is already taken!');
	});

	socket.on('message sent', data => {
		const message = document.createElement('div');
		message.innerHTML = `<b>${data.name}</b> (${data.date})<br> ${data.message}`;
		message.className = "message";

		document.querySelector(`#v-pills-${data.channel}`).append(message);
	});
});