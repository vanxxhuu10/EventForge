const events = [
    {
      date: 'Jan 26',
      title: 'Republic Day',
      desc: 'The Republic Day event commenced with the Chief Guest hoisting the Indian flag, followed by the national anthem. A cultural dance performance reflected the spirit of patriotism and national unity. The Chief Guest then delivered a speech, highlighting the importance of the Constitution and the role of citizens in upholding democratic values. The audience engaged with great enthusiasm, appreciating the message of responsibility and progress. To mark the occasion, sweets were distributed, adding to the celebratory spirit.',
      link: '#republic-day'
    },
    {
      date: 'February',
      title: 'Vibrance Expo',
      desc: 'Fun and fiery debate on love, logic and leadership!',
      link: '#valentine'
    },
    {
      date: 'February - March',
      title: 'VIBRANCE',
      desc: 'Panel discussions and awareness drive on women empowerment.',
      link: '#womens-day'
    },
    {
      date: 'June',
      title: 'Online Events',
      desc: 'Green initiative: Clean and plant trees around campus.',
      link: '#earth-day'
    },
    {
      date: 'July',
      title: 'Club Expo',
      desc: 'Flag hoisting with cultural programs and student march.',
      link: '#independence-day'
    },
    {
      date: 'July',
      title: 'Freshathon',
      desc: 'Flag hoisting with cultural programs and student march.',
      link: '#independence-day'
    },
    {
      date: 'August',
      title: 'Cultural Showdown',
      desc: 'Meet our teams, learn our vision, and get onboarded.',
      link: '#orientation'
    },
   {
      date: '15 August',
      title: 'Independence Day',
      desc: 'Meet our teams, learn our vision, and get onboarded.',
      link: '#orientation'
    },
    {
      date: 'September',
      title: 'TechnoVIT',
      desc: 'Celebrate the year-end with games, snacks and joy!',
      link: '#christmas'
    },
    {
      date: 'October',
      title: 'Power Transfer',
      desc: 'Meet our teams, learn our vision, and get onboarded.',
      link: '#orientation'
    },
    {
      date: '25 December',
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