import React, { useState } from "react"
import { View, Text, TextInput, StyleSheet } from "react-native"

const CardDetailsForm = () => {
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
  })

  const [errors, setErrors] = useState({})

  const handleChange = (name, value) => {
    // Format card number with spaces
    if (name === "cardNumber") {
      const formattedValue = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim()
        .slice(0, 19)

      setCardDetails({ ...cardDetails, [name]: formattedValue })

      // Validate card number
      if (formattedValue.replace(/\s/g, "").length > 0 && !/^\d{4}\s\d{4}\s\d{4}\s\d{0,4}$/.test(formattedValue)) {
        setErrors({ ...errors, [name]: "Please enter a valid card number" })
      } else {
        const newErrors = { ...errors }
        delete newErrors[name]
        setErrors(newErrors)
      }
      return
    }

    // Format expiry date
    if (name === "expiryDate") {
      const formattedValue = value
        .replace(/\//g, "")
        .replace(/(\d{2})(\d{0,2})/, "$1/$2")
        .slice(0, 5)

      setCardDetails({ ...cardDetails, [name]: formattedValue })

      // Validate expiry date
      if (formattedValue.length > 0 && !/^\d{2}\/\d{2}$/.test(formattedValue)) {
        setErrors({ ...errors, [name]: "Please enter a valid date (MM/YY)" })
      } else {
        const newErrors = { ...errors }
        delete newErrors[name]
        setErrors(newErrors)
      }
      return
    }

    // Handle other fields
    setCardDetails({ ...cardDetails, [name]: value })

    // Validate CVV
    if (name === "cvv") {
      if (value.length > 0 && !/^\d{3,4}$/.test(value)) {
        setErrors({ ...errors, [name]: "CVV must be 3 or 4 digits" })
      } else {
        const newErrors = { ...errors }
        delete newErrors[name]
        setErrors(newErrors)
      }
    }

    // Validate cardholder name
    if (name === "cardholderName") {
      if (value.length > 0 && value.length < 3) {
        setErrors({ ...errors, [name]: "Please enter a valid name" })
      } else {
        const newErrors = { ...errors }
        delete newErrors[name]
        setErrors(newErrors)
      }
    }
  }

  return (
    <View style={styles.formContainer}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Card Number</Text>
        <TextInput
          style={[styles.input, errors.cardNumber && styles.errorInput]}
          placeholder="1234 5678 9012 3456"
          value={cardDetails.cardNumber}
          onChangeText={(value) => handleChange("cardNumber", value)}
          keyboardType="numeric"
        />
        {errors.cardNumber && <Text style={styles.errorText}>{errors.cardNumber}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Cardholder Name</Text>
        <TextInput
          style={[styles.input, errors.cardholderName && styles.errorInput]}
          placeholder="John Doe"
          value={cardDetails.cardholderName}
          onChangeText={(value) => handleChange("cardholderName", value)}
        />
        {errors.cardholderName && <Text style={styles.errorText}>{errors.cardholderName}</Text>}
      </View>

      <View style={styles.rowContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Expiry Date</Text>
          <TextInput
            style={[styles.input, errors.expiryDate && styles.errorInput]}
            placeholder="MM/YY"
            value={cardDetails.expiryDate}
            onChangeText={(value) => handleChange("expiryDate", value)}
            keyboardType="numeric"
          />
          {errors.expiryDate && <Text style={styles.errorText}>{errors.expiryDate}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>CVV</Text>
          <TextInput
            style={[styles.input, errors.cvv && styles.errorInput]}
            placeholder="123"
            value={cardDetails.cvv}
            onChangeText={(value) => handleChange("cvv", value)}
            keyboardType="numeric"
            maxLength={4}
          />
          {errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    fontSize: 16,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  errorInput: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
})

export default CardDetailsForm
