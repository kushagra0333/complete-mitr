import React from 'react';
import Hero from '../components/hero';
import About from '../components/about'
import HowItWorks from "../components/HowItWorks"
import Features from '../components/Feature';
import Footer from '../components/footer/footer';
import ContactUs from '../components/contact';
import UseCase from '../components/useCase';
import './home.css';
const Home = ()=>{
    return (
        <div className='home'>
            <Hero />
            <About />
            <UseCase />
            <Features />
            <HowItWorks />
            {/* <ContactUs /> */}

            
            <Footer />
        </div>
    )
}
export default Home;