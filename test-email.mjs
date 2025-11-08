import nodemailer from 'nodemailer';

console.log('=== Test SMTP Direct ===');

// Configuration SMTP (à remplacer par vos vraies valeurs)
const config = {
  host: 'mail.gdnn.be',
  port: 587,
  secure: false,
  user: 'carrouselgdn@gdnn.be',
  pass: 'Gdn24@cccf', // Remplacez par le vrai mot de passe
  from: 'carrouselgdn@gdnn.be',
  to: 'f.dedobbeleer@fdweb.be',
};

console.log('Configuration:', {
  host: config.host,
  port: config.port,
  secure: config.secure,
  user: config.user,
  hasPass: !!config.pass,
});

const transporter = nodemailer.createTransport({
  host: config.host,
  port: config.port,
  secure: config.secure,
  auth: {
    user: config.user,
    pass: config.pass,
  },
});

console.log('Transporter créé, tentative d\'envoi...');

try {
  const result = await transporter.sendMail({
    from: config.from,
    to: config.to,
    subject: 'Test SMTP depuis Carrousel GdN',
    text: 'Ceci est un email de test pour vérifier la configuration SMTP.',
    html: '<p>Ceci est un email de test pour vérifier la configuration SMTP.</p>',
  });
  
  console.log('✅ Email envoyé avec succès!');
  console.log('Message ID:', result.messageId);
  console.log('Response:', result.response);
} catch (error) {
  console.error('❌ Erreur d\'envoi:');
  console.error('Message:', error.message);
  console.error('Code:', error.code);
  console.error('Command:', error.command);
  console.error('Response:', error.response);
  console.error('Stack:', error.stack);
}
