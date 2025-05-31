const events = [
    {
      date: 'January 26',
      title: 'Republic Day',
      desc: 'The Republic Day celebration began with the ceremonial hoisting of the national flag, followed by the national anthem. The event featured cultural performances that showcased themes of patriotism and unity. A keynote speech emphasized the significance of the Constitution and the responsibilities of citizens in a democratic society. The audience participated with enthusiasm, embracing the events message of national pride and collective progress. The celebration concluded with the distribution of sweets, adding to the festive atmosphere.',
      link: '#republic-day'
    },
    {
      date: 'February',
      title: 'Vibrance Expo',
      desc: 'The Vibrance CLub Expo is a grand showcase of 90 active clubs, chapters, special teams, and societies at VIT Chennai, focused on presenting the wide range of opportunities available to freshers on campus. It provides a platform for each group to highlight their uniqueness, share their vision, and connect with students who have similar interests. With a significant rise in the number of participating clubs this year, the expo stands out as a vibrant and engaging event. Freshers explore a variety of cultural and technical activities and show great enthusiasm in becoming part of the dynamic campus community.',
      link: '#valentine'
    },
    {
      date: 'February - March',
      title: 'VIBRANCE',
      desc: 'Vibrance is the annual cultural fest of VIT Chennai that brings together students from diverse backgrounds to celebrate creativity, talent, and expression. The event features a wide range of activities including dance, music, drama, fashion, literary arts, and more, offering something for everyone. It serves as a platform for students to showcase their skills, compete, and collaborate in an atmosphere filled with energy and enthusiasm. With vibrant performances, engaging competitions, and enthusiastic participation, Vibrance captures the spirit of college life and fosters a strong sense of community and celebration.',
      link: '#womens-day'
    },
    {
      date: 'June',
      title: 'Online Events',
      desc: 'During the summer holidays, a series of engaging online events are conducted to keep students connected, creative, and productive. These events typically include interactive competitions, workshops, and webinars spanning various domains such as coding, design, literature, public speaking, and more. The aim is to provide a platform for skill-building, knowledge-sharing, and fun engagement, even during the break. Students actively participate from the comfort of their homes, making the most of their vacation through learning and collaboration in a flexible and inclusive virtual environment.',
      link: '#earth-day'
    },
    {
      date: 'July',
      title: 'Club Expo',
      desc: 'The Club Expo at VIT Chennai is a vibrant and welcoming event organized especially for freshers as they begin their college journey. Featuring 90 active clubs, chapters, special teams, and societies, the expo introduces students to the diverse range of opportunities available on campus. It allows each group to showcase their purpose, activities, and achievements while helping freshers discover communities that match their interests. With an impressive increase in participation this year, the event creates an energetic atmosphere where new students eagerly explore cultural, technical, and interest-based clubs, setting the tone for an enriching college experience.',
      link: '#independence-day'
    },
    {
      date: 'July',
      title: 'Freshathon',
      desc: 'Freshathon is an exciting series of events organized by the Event Management Committee (EMC) specifically for freshers. Designed to welcome new students, it includes a variety of fun and engaging competitions, games, and activities that encourage participation, teamwork, and creativity. Freshathon offers freshers a great opportunity to interact with their peers, showcase their talents, and get a feel for campus life. The event series fosters a lively and inclusive environment, making it a memorable start to their college journey.',
      link: '#independence-day'
    },
    {
      date: 'August',
      title: 'Cultural Showdown',
      desc: 'Cultural Showdown is a dynamic event that brings together students to celebrate and compete through diverse cultural performances. It features a range of artistic expressions such as dance, music, drama, and more, showcasing the rich talents and creativity of the participants. This event fosters healthy competition while promoting cultural appreciation and unity among students. Cultural Showdown provides an exciting platform for individuals and teams to display their skills, connect with peers, and contribute to the vibrant campus culture.',
      link: '#orientation'
    },
   {
      date: 'August 15',
      title: 'Independence Day',
      desc: 'Independence Day is a significant celebration that honors the freedom and sovereignty of the nation. The event typically begins with the hoisting of the national flag, followed by the singing of the national anthem. It includes speeches that reflect on the country’s history, struggles for independence, and the responsibilities of citizens. Cultural performances such as patriotic songs and dances highlight national pride and unity. The occasion brings together the community to remember the nation’s journey and inspire a shared commitment to progress and harmony.',
      link: '#orientation'
    },
    {
      date: 'August - September',
      title: 'TechnoVIT',
      desc: 'TechnoVIT is an annual technical festival that showcases innovation, creativity, and technological expertise among students. The event features a wide array of competitions, workshops, hackathons, and exhibitions across various engineering and technology domains. It provides a platform for participants to challenge their skills, collaborate on projects, and learn from experts in the field. TechnoVIT encourages problem-solving, technical excellence, and networking, making it a key event that inspires and empowers the tech community on campus.',
      link: '#christmas'
    },
    {
      date: 'December 25',
      title: 'Christmas',
      desc: 'The evening unfolded as a Christmas-themed musical celebration hosted by the Event Managers Club and Music Club of VIT Chennai. Student bands lit up the stage, filling the auditorium with festive cheer and captivating performances. From soulful melodies to high-energy beats, each act brought a distinct rhythm and creative flair, making the event a true showcase of talent and artistry',
      link: '#orientation'
    }
  ];

  const container = document.getElementById("zigzag-events");

    events.forEach(event => {
    const card = document.createElement("a");
    card.href = "annual-events.html";
    card.className = "zigzag-event";
    card.innerHTML = `
      <div class="event-date">${event.date}</div>
      <div class="event-title">${event.title}</div>
      <div class="event-desc">${event.desc}</div>
    `;
    container.appendChild(card);
  });

  const audio = document.getElementById('background-audio');
const muteBtn = document.getElementById('mute-btn');
const canvas = document.getElementById('audio-visualizer');
const ctx = canvas.getContext('2d');

canvas.width = 200;
canvas.height = 100;

let audioCtx, analyser, source, dataArray, bufferLength;

function setupAudioContext() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  source = audioCtx.createMediaElementSource(audio);

  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  analyser.fftSize = 128; // Number of data points (smaller = less bars)
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
}

function drawVisualizer() {
  requestAnimationFrame(drawVisualizer);

  analyser.getByteFrequencyData(dataArray);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const barWidth = canvas.width / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const barHeight = dataArray[i];

    // Color shifts from green to red based on bar height
    const red = barHeight + 100;
    const green = 250 - barHeight;
    const blue = 50;

    ctx.fillStyle = `rgb(${red},${green},${blue})`;
    ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

    x += barWidth;
  }
}

muteBtn.addEventListener('click', () => {
  audio.muted = !audio.muted;
  muteBtn.textContent = audio.muted ? '🔇' : '🔊';
  canvas.style.opacity = audio.muted ? 0.3 : 1;
});

audio.addEventListener('play', () => {
  if (!audioCtx) {
    setupAudioContext();
  }

  // Resume audio context (needed in some browsers)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  drawVisualizer();
});

audio.volume = 0.2;
audio.play().catch(() => {
  audio.muted = true; // Start muted if autoplay blocked
  muteBtn.textContent = '🔇';
  canvas.style.opacity = 0.3;
});
