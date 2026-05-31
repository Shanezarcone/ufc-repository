const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const FIGHTERS = [
  ["Islam Makhachev","Lightweight"],["Charles Oliveira","Lightweight"],["Dustin Poirier","Lightweight"],["Justin Gaethje","Lightweight"],["Arman Tsarukyan","Lightweight"],["Beneil Dariush","Lightweight"],["Michael Chandler","Lightweight"],["Dan Hooker","Lightweight"],["Mateusz Gamrot","Lightweight"],["Paddy Pimblett","Lightweight"],["Conor McGregor","Lightweight"],["Tony Ferguson","Lightweight"],["Rafael Fiziev","Lightweight"],["Bobby Green","Lightweight"],["Jalin Turner","Lightweight"],["Renato Moicano","Lightweight"],["Drawing Poirier","Lightweight"],
  ["Alexander Volkanovski","Featherweight"],["Ilia Topuria","Featherweight"],["Max Holloway","Featherweight"],["Brian Ortega","Featherweight"],["Yair Rodriguez","Featherweight"],["Josh Emmett","Featherweight"],["Arnold Allen","Featherweight"],["Calvin Kattar","Featherweight"],["Giga Chikadze","Featherweight"],["Bryce Mitchell","Featherweight"],["Sodiq Yusuff","Featherweight"],["Shane Burgos","Featherweight"],["Lucas Almeida","Featherweight"],["Diego Lopes","Featherweight"],["Movsar Evloev","Featherweight"],
  ["Sean O'Malley","Bantamweight"],["Merab Dvalishvili","Bantamweight"],["Aljamain Sterling","Bantamweight"],["Henry Cejudo","Bantamweight"],["Marlon Vera","Bantamweight"],["Petr Yan","Bantamweight"],["Cory Sandhagen","Bantamweight"],["Dominick Cruz","Bantamweight"],["Song Yadong","Bantamweight"],["Rob Font","Bantamweight"],["Jose Aldo","Bantamweight"],["Umar Nurmagomedov","Bantamweight"],["Mario Bautista","Bantamweight"],["Deiveson Figueiredo","Bantamweight"],["Jonathan Martinez","Bantamweight"],
  ["Alexandre Pantoja","Flyweight"],["Brandon Royval","Flyweight"],["Amir Albazi","Flyweight"],["Brandon Moreno","Flyweight"],["Kai Kara France","Flyweight"],["Manel Kape","Flyweight"],["Matheus Nicolau","Flyweight"],["David Dvorak","Flyweight"],["Tim Elliott","Flyweight"],["Steve Erceg","Flyweight"],["Muhammad Mokaev","Flyweight"],["Casey O'Neill","Flyweight"],["Tatsuro Taira","Flyweight"],["Tagir Ulanbekov","Flyweight"],
  ["Leon Edwards","Welterweight"],["Colby Covington","Welterweight"],["Kamaru Usman","Welterweight"],["Belal Muhammad","Welterweight"],["Gilbert Burns","Welterweight"],["Jorge Masvidal","Welterweight"],["Sean Brady","Welterweight"],["Vicente Luque","Welterweight"],["Ian Machado Garry","Welterweight"],["Shavkat Rakhmonov","Welterweight"],["Jack Della Maddalena","Welterweight"],["Michael Morales","Welterweight"],["Kevin Holland","Welterweight"],["Neil Magny","Welterweight"],["Geoff Neal","Welterweight"],["Carlos Prates","Welterweight"],["Joaquin Buckley","Welterweight"],
  ["Dricus du Plessis","Middleweight"],["Israel Adesanya","Middleweight"],["Sean Strickland","Middleweight"],["Robert Whittaker","Middleweight"],["Khamzat Chimaev","Middleweight"],["Paulo Costa","Middleweight"],["Marvin Vettori","Middleweight"],["Brendan Allen","Middleweight"],["Roman Dolidze","Middleweight"],["Chris Weidman","Middleweight"],["Nassourdine Imavov","Middleweight"],["Joe Pyfer","Middleweight"],["Gregory Rodrigues","Middleweight"],["Jared Cannonier","Middleweight"],["Brad Tavares","Middleweight"],["Ikram Aliskerov","Middleweight"],
  ["Alex Pereira","Light Heavyweight"],["Jiri Prochazka","Light Heavyweight"],["Magomed Ankalaev","Light Heavyweight"],["Jamahal Hill","Light Heavyweight"],["Aleksandar Rakic","Light Heavyweight"],["Jan Blachowicz","Light Heavyweight"],["Khalil Rountree","Light Heavyweight"],["Johnny Walker","Light Heavyweight"],["Anthony Smith","Light Heavyweight"],["Dominick Reyes","Light Heavyweight"],["Corey Anderson","Light Heavyweight"],["Ryan Spann","Light Heavyweight"],["Carlos Ulberg","Light Heavyweight"],["Bogdan Guskov","Light Heavyweight"],
  ["Jon Jones","Heavyweight"],["Stipe Miocic","Heavyweight"],["Ciryl Gane","Heavyweight"],["Tom Aspinall","Heavyweight"],["Curtis Blaydes","Heavyweight"],["Sergei Pavlovich","Heavyweight"],["Alexander Volkov","Heavyweight"],["Tai Tuivasa","Heavyweight"],["Jailton Almeida","Heavyweight"],["Derrick Lewis","Heavyweight"],["Marcos Rogerio de Lima","Heavyweight"],["Chris Barnett","Heavyweight"],["Serghei Spivac","Heavyweight"],["Alexey Oleynik","Heavyweight"],["Valter Walker","Heavyweight"],["Shamil Gaziev","Heavyweight"],
  ["Zhang Weili","Women's Strawweight"],["Yan Xiaonan","Women's Strawweight"],["Carla Esparza","Women's Strawweight"],["Rose Namajunas","Women's Strawweight"],["Jessica Andrade","Women's Strawweight"],["Marina Rodriguez","Women's Strawweight"],["Amanda Lemos","Women's Strawweight"],["Mackenzie Dern","Women's Strawweight"],["Luana Pinheiro","Women's Strawweight"],["Virna Jandiroba","Women's Strawweight"],["Tabatha Ricci","Women's Strawweight"],
  ["Valentina Shevchenko","Women's Flyweight"],["Alexa Grasso","Women's Flyweight"],["Taila Santos","Women's Flyweight"],["Manon Fiorot","Women's Flyweight"],["Erin Blanchfield","Women's Flyweight"],["Natalia Silva","Women's Flyweight"],["Jennifer Maia","Women's Flyweight"],["Maycee Barber","Women's Flyweight"],["Katlyn Chookagian","Women's Flyweight"],["Viviane Araujo","Women's Flyweight"],
  ["Julianna Pena","Women's Bantamweight"],["Amanda Nunes","Women's Bantamweight"],["Raquel Pennington","Women's Bantamweight"],["Holly Holm","Women's Bantamweight"],["Kayla Harrison","Women's Bantamweight"],["Mayra Bueno Silva","Women's Bantamweight"],["Irene Aldana","Women's Bantamweight"],["Norma Dumont","Women's Bantamweight"],["Sara McMann","Women's Bantamweight"]
];

exports.handler = async (event) => {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Clear existing fighters
    await supabase.from('fighters').delete().neq('id', 0);

    // Insert updated roster
    const rows = FIGHTERS.map(([name, weight_class]) => ({ name, weight_class }));
    const { error } = await supabase.from('fighters').insert(rows);

    if (error) throw error;

    console.log(`[FightIQ] Updated fighter roster: ${rows.length} fighters`);
    return { statusCode: 200, body: JSON.stringify({ updated: rows.length }) };
  } catch (err) {
    console.error('Update fighters error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
