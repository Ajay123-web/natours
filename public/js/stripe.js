import axios from 'axios';

export const bookTour = async (tourId) => {
  const stripe = Stripe(
    'pk_test_51KMcVRSGy9VXmPmnGUMhxGfvc9DJM9Ob37xZ4rQ1VFD4I5dK5fGPj2bAsWx2Zztl6H9udKNfLUuHQmwMVwaDlhof00PFtMqRjE'
  );
  try {
    //GET THE SESSION FROM API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    //console.log(session);

    //CREATE CHECKOUT FORM + CHARGE THE CREDIT CARD
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    alert('Something went wrong');
  }
};
