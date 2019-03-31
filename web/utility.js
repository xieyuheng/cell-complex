window.addEventListener ("visibilitychange", () => {
  if (document.hidden) console.log ("hidden")
  else console.log ("focused")
})

console.log (navigator.onLine ? "online" : "offline")
