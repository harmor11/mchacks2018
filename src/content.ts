//
// div launcher
// |-- input input
// |-- div container
//     |-- a cmd1
//     |-- a cmd2

var css = `
#launcher {
	width: 400px;
	background-color: #39264F;
	position: fixed;
	top: 0;
	left: 50%;
	transform: translate(-50%, 0);
	padding: 5px;
	opacity: 0.95;
	box-shadow: 0 0 5px 8px rgba(0,0,0,0.2);
	border-radius: 5px;
	z-index: 100000;
}

#launcher a {
	display: block;
	padding: 15px;
	color: white;
	font-size: 14px;
	text-decoration: none;
}

#launcher a.selected {
	background-color: #614F75;
	color: #fff;
}

#launcher a span.matched {
	text-decoration: underline;
	font-weight: bold;
	color: red
}
 
`
var style = document.createElement('style');

if (style['styleSheet']) {
    style['styleSheet'].cssText = css;
} else {
    style.appendChild(document.createTextNode(css));
}

document.getElementsByTagName('head')[0].appendChild(style);

interface Command {
	score: number,
	matches: number[],
	text: string
}

function score(query: string, command: string): Command {
	const matches: number[] = []
	let score = 0
	let j = 0
	if (query !== '') {
		for (let i = 0; i < command.length; i++) {
			if (command[i].toLowerCase() === query[j].toLowerCase()) {
				score++
				matches.push(i)
				j++
				if (j === query.length) {
					break
				}
			}
		}
	}
	return {
		score,
		matches,
		text: command
	}
}

const commands = ['New tab', 'Bookmark this page', 'Exit', 'Open bookmark...', 'New window']
let query = ""
let commandIndex = 0
let focused = false

function createElem(tag: string, style: object) {
	const elem = document.createElement(tag)
	for (let key in style) {
		if (style.hasOwnProperty(key)) {
			elem.style[key] = style[key]
		}
	}
	return elem
}

const launcher = document.createElement('div')
launcher.id = 'launcher'
document.body.appendChild(launcher)

const input = createElem('input', {
	placeholder: 'Enter a command',
	width: '100%',
	height: '48px',
	border: '0',
	fontSize: '20px',
	marginLeft: '10px',
	type: 'text',
	backgroundColor: 'transparent',
	color: '#eeeeee'
})
input.addEventListener('blur', closeLauncher)
input.addEventListener('keyup', (_) => {
	query = input['value']
	console.log('changed', query)
	generateCommands()
})
launcher.appendChild(input)

let container = null

generateCommands()

function generateCommands() {
	// Generate the container
	if (container) {
		launcher.removeChild(container)
	}
	container = createElem('div', {
		margin: '5px 0'
	})
	launcher.appendChild(container)

	// Calculate the score of each command
	let scoredCommands = commands.map((cmd) => score(query, cmd))
	scoredCommands.sort((x, y) => y.score - x.score)

	// Add the commands
	let i = 0;
	for (let cmd of scoredCommands) {
		const cmdElem = document.createElement('a')
		if (i === commandIndex) {
			cmdElem.classList.add('selected')
		}
		let j = 0;
		let k = 0;
		console.log(cmd)
		for (let char of cmd.text) {
			let span = document.createElement('span')
			span.innerText = char
			if (k < cmd.matches.length && j == cmd.matches[k]) {
				//style['text-decoration'] = 'underline'
				span.classList.add('matched')
				k++
			}
			cmdElem.appendChild(span)
			j++;
		}
		container.appendChild(cmdElem)
		i += 1
	}
}

function openLauncher() {
	launcher.style.visibility = "visible"
	input.focus()
	focused = true
}

function closeLauncher() {
	launcher.style.visibility = "hidden"
	input['value'] = ''
	query = ''
	focused = false
	generateCommands()
}

function onKeyPress(e) {
	if (focused) {
		if (e.key == 'ArrowDown') {
			commandIndex = (commandIndex + 1) % commands.length
			generateCommands()
		} else if (e.key == 'ArrowUp') {
			commandIndex = ((commandIndex - 1) + commands.length) % commands.length
			generateCommands()
		}
	} else {
		if (e.key === 'e'){
			openLauncher()
		}
	}
}

closeLauncher()
window.addEventListener('keypress', onKeyPress)