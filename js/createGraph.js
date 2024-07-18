const splashTexts = [
	// The sign on Skip's house
	"NOT UP TO FIRE CODE",
	// 🤓
	"Type \"nerd\" for easter egg",
	// Observer still eating their steak since episode 2
	"Don't forget to feed your observers",
	// Skip getting "Best Friends Forever", then killing said friend
	"Best friends for<span class=\"stroke\">ever</span> 5 seconds",
	// Burried treasure + Trial chambers being near Skip's house
	"SkipLand: Everything you need, in walking distance",
	// Reference to the raw milk story
	"Louis Pasteur didn't die for this"
]
document.getElementById("splashText").innerHTML = splashTexts[Math.floor(Math.random() * splashTexts.length)]

const canvas = document.getElementById("chart")

let leastAdvancements = 122
let leastAdvancementsEpisodes = []
let mostAdvancements = -1
let mostAdvancementsEpisodes = []

let days = []
let episodeAdvancements = []
let totalAdvancements = []
let advancementCount = 0

let episodeLists = document.getElementsByClassName("episodeList")

function dayToHuman(day) {
	let dayStr = day.toString()
	let lastDigit = dayStr.substr(-1)
	if(lastDigit === "1" && dayStr !== "11") {
		dayStr = dayStr + "st"
	} else if(lastDigit === "2" && dayStr !== "12") {
		dayStr = dayStr + "nd"
	} else if(lastDigit === "3" && dayStr !== "13") {
		dayStr = dayStr + "rd"
	} else {
		dayStr = dayStr + "th"
	}
	return dayStr
}

function getBottomOfList(list) {
	let lastChild = list.lastChild
	if(lastChild === null) {
		return 0
	}
	return lastChild.getBoundingClientRect().bottom
}

function getSmallestList() {
	if(getBottomOfList(episodeLists[1]) < getBottomOfList(episodeLists[0])) {
		return episodeLists[1]
	}
	return episodeLists[0]
}

for(let index in episodes) {
	let i = parseInt(index)
	let episode = episodes[i]
	let episodeList = getSmallestList()

	days[i] = dayToHuman(i+1)

	let advancements = episode.advancements.length
	episodeAdvancements[i] = advancements

	if(leastAdvancements > advancements) {
		leastAdvancements = advancements
		leastAdvancementsEpisodes = [i]
	} else if(leastAdvancements == advancements) {
		leastAdvancementsEpisodes.push(i)
	}

	if(mostAdvancements < advancements) {
		mostAdvancements = advancements
		mostAdvancementsEpisodes = [i]
	} else if(mostAdvancements == advancements) {
		mostAdvancementsEpisodes.push(i)
	}

	advancementCount += advancements
	totalAdvancements[i] = advancementCount

	let episodeItem = document.createElement("li")
	let episodeLink = document.createElement("a")

	episodeLink.innerText = episode.title
	episodeLink.href = `https://youtube.com/watch?v=${episode.videoId}`
	episodeLink.target = "_blank"
	episodeItem.appendChild(episodeLink)
	episodeItem.appendChild(document.createTextNode(":"))
	episodeList.appendChild(episodeItem)

	if(episode.advancements.length == 0) {
		let s
		if(advancementCount == 122) {
			s = "All advancements were earned, gg!!"
		} else {
			s = "No advancements were earned this episode"
		}
		episodeItem.appendChild(document.createElement("br"))
		episodeItem.appendChild(document.createTextNode(s))
	} else {
		let advancementList = document.createElement("ul")

		for(let advancementName of episode.advancements) {
			let advancementItem = document.createElement("li")
			advancementItem.appendChild(generateAdvancementBadge(advancementName))
			advancementList.appendChild(advancementItem)
		}
		episodeItem.appendChild(advancementList)
	}
}

function makeMinMaxStr(minmax, amount, episodes) {
	let advancementStr = `advancement${amount == 1 ? "" : "s"}`
	if(episodes.length == 1) {
		return `The episode with the ${minmax} advancements earned is #${episodes[0] + 1} with ${amount} ${advancementStr}`
	}
	let s = `The episodes with the ${minmax} advancements earned were #${episodes[0] + 1}`
	for(let i = 1; i < episodes.length; i++) {
		if(i === episodes.length - 1) {
			s = s + " and "
		} else {
			s = s + ", "
		}
		s = s + `#${episodes[i] + 1}`
	}
	return s + ` with ${amount} ${advancementStr}`
}

document.getElementById("least").innerText = makeMinMaxStr("least", leastAdvancements, leastAdvancementsEpisodes)
document.getElementById("most").innerText = makeMinMaxStr("most", mostAdvancements, mostAdvancementsEpisodes)
let average = Math.round((advancementCount / episodes.length)*1000) / 1000
document.getElementById("average").innerText = `On average, Skip got ~${average} advancements per episode`
let remaining = 122 - advancementCount
let estimate = episodes.length + Math.ceil(remaining / average)
document.getElementById("estimate").innerText = `With ${122 - advancementCount} advencement(s) remaining, the goal might be reached around June ${dayToHuman(estimate)}`

Chart.defaults.font.family = "Minecraftio"
Chart.defaults.font.size = 16
Chart.defaults.color = "#FFFFFF"

let chart = new Chart(canvas, {
	type: "line",
	data: {
		labels: days,
		datasets: [{
			label: "Number of advancements",
			data: totalAdvancements,
			borderWidth: 2,
			borderColor: "#FF0000",
			backgroundColor: "#FF7F7F"
		}]
	},
	options: {
		responsive: true,
		scales: {
			y: { beginAtZero: true, max: 122 }
		},
		events: ["mousemove", "mouseout", "touchstart", "touchmove"]
	}
})

function changeChart(btn, data, maxY) {
	(btn == totalButton ? episodeButton : totalButton).classList.remove("selected")
	btn.classList.add("selected")
	chart.data.datasets[0].data = data
	chart.options.scales.y.max = maxY
	chart.update()

	new Audio("assets/click.ogg").play()
}

let totalButton = document.getElementById("totalButton")
totalButton.addEventListener("click", (e) => changeChart(totalButton, totalAdvancements, 122))

let episodeButton = document.getElementById("episodeButton")
let episodeGraphMax = mostAdvancements
if(episodeGraphMax % 2 == 1) {
	episodeGraphMax += 1
} else {
	episodeGraphMax += 2
}
episodeButton.addEventListener("click", (e) => changeChart(episodeButton, episodeAdvancements, episodeGraphMax))

let nerd = document.getElementById("nerd")
nerd.style.transition = "translate 0.5s ease-in-out"
easterEggIndex = 0
easterEggText = "nerd"
document.addEventListener("keydown", (e) => {
	if(e.key == easterEggText.charAt(easterEggIndex)) {
		easterEggIndex ++
		if(easterEggIndex == easterEggText.length) {
			easterEggIndex = 0
			nerd.classList.toggle("show")
		}
	} else {
		easterEggIndex = 0
	}
});