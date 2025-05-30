const events = [
    {
      date: 'Jan 26',
      title: 'Republic Day Rally',
      desc: 'Annual patriotic event with parade, speeches, and performances.',
      link: '#republic-day'
    },
    {
      date: 'Feb 14',
      title: 'Valentine Debate',
      desc: 'Fun and fiery debate on love, logic and leadership!',
      link: '#valentine'
    },
    {
      date: 'Mar 08',
      title: 'Women’s Day Campaign',
      desc: 'Panel discussions and awareness drive on women empowerment.',
      link: '#womens-day'
    },
    {
      date: 'Apr 22',
      title: 'Earth Day Drive',
      desc: 'Green initiative: Clean and plant trees around campus.',
      link: '#earth-day'
    },
    {
      date: 'Aug 15',
      title: 'Independence Day Parade',
      desc: 'Flag hoisting with cultural programs and student march.',
      link: '#independence-day'
    },
    {
      date: 'Sep 27',
      title: 'Club Orientation',
      desc: 'Meet our teams, learn our vision, and get onboarded.',
      link: '#orientation'
    },
    {
      date: 'Oct 31',
      title: 'Halloween Hackathon',
      desc: 'Coding + Costumes! A fun overnight development hackathon.',
      link: '#halloween'
    },
    {
      date: 'Dec 25',
      title: 'Christmas Bash',
      desc: 'Celebrate the year-end with games, snacks and joy!',
      link: '#christmas'
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