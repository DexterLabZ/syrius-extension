const animationVariants = {
  pageTransitionInitial: {
    opacity: 0,
    paddingTop: "16px",
    transition: {
      ease: "easeInOut",
      duration: 0.4
    }
  },
  
  pageTransitionAnimate: {
    opacity: 1,
    paddingTop: "0px",
    transition: {
      ease: "easeInOut",
      duration: 0.8
    }
  },
  
  pageTransitionExit: {
    opacity: 0,
    transition: {
      ease: "easeInOut",
      duration: 0.4
    }
  }
}

export default animationVariants